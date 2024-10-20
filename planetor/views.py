from cgitb import reset
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from . import planetor
from django.http import JsonResponse
from django.http import FileResponse
import mimetypes
import os
import re
import json
import hashlib
import time
import random
import glob
import subprocess
import psutil

# NOTE: functions that aren't designed to respond directly to django requests, end with _py (native python). i.e. they
# are just normal functions. Functions that don't have _py have only one parameter: request, as they are for responses
# to pythong GETs

# gallery is where the planet mp4s are store
GalleryDir = "/app/planetor/out/gallery"
StillsDir = "/app/planetor/out/stills"
SpecsDir = "/app/planetor/out/specs"
MessagesDir = "/app/planetor/out/messages"
LogDir = "/app/planetor/out/logs"

def execstring(command):
    # shlex supposedly escape special characters so users can't pass sneaking shell parameters
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)

    output = ""
    while p.poll() is None:
        temp = p.stdout.read()
        try:
            output += temp.decode("utf-8", errors='replace')
        except:
            output += temp.decode("string_escape", errors='replace')

    return output

def preview_planet(request):
    selections = request.GET
    res = planetor.generate(selections, "/app/planetor", "FRAMES=1")
    return JsonResponse(res)

def generate_planet(request):
    planetid = request.GET.get('id')
    user = request.GET.get('user')
    planetdata = planetor.DbRead("specs", planetid)
    myuserdata = planetor.DbRead("user", user)
    
    # if the planet already exists, don't regenerate it
    if os.path.exists("%s/planet_%s.mp4" % (GalleryDir, planetid)):
        if not planetid in myuserdata['planets']:
            myuserdata['planets'].insert(0, planetid)
            planetor.DbUpdate("user", user, myuserdata)
        return JsonResponse({})

    #planetdata['identity'] = None # force a new planet, don't modify an existing one
    res = planetor.generate(planetdata, "/app/planetor", "FRAMES=200")
    # already has this planet? don't make a duplicate entry
    if not planetid in myuserdata['planets']:
        myuserdata['planets'].insert(0, planetid)
        planetor.DbUpdate("user", user, myuserdata)
    return JsonResponse(res)

def proc_count(name):
    count = 0
    for proc in psutil.process_iter(['name']):
        if proc.info['name'] == name:
            count += 1
    print("%d instances of %s running" % (count, name))
    return count
    
def povwait(procname):
    limit = 4
    while(proc_count(procname) > limit):
        print("%d sleeping" % os.getpid())
        time.sleep(5)
    print("%d woke up" % os.getpid())

def regenerate_planet(request): # overwrite an already existing planet
    planetid = request.GET.get('id')
    planetdata = planetor.DbRead("specs", planetid)

    log_rotor = int(time.time()%3600/60)
    povray_command = "FRAMES=200 ./generate.sh '%s' > %s/generate_%s.log 2>&1 &" % (planetid, LogDir, log_rotor)

    print("GENERATE.sh COMMAND:%s" % povray_command)

    execstring(povray_command)
    
    return JsonResponse({})

def claimplanet(request):
    planetid = request.GET.get('id')
    user = request.GET.get('user')
    try:
        planetdata = readfile_py("%s/specs_%s.json" % (SpecsDir, planetid))
    except:
        planetdata = readfile_py("%s/specs_10000.json" % SpecsDir)
    params = json.loads(planetdata)
    myuserdata = planetor.DbRead("user", user)
    # already has this planet? don't make a duplicate entry
    if not planetid in myuserdata['planets']:
        myuserdata['planets'].insert(0, planetid)
    planetor.DbUpdate("user", user, myuserdata)
    return JsonResponse({"data": myuserdata})

def editspecs(request): # generate specs for UI to edit a planet
    planetid = request.GET.get('id')
    try:
        planetdata = readfile_py("%s/specs_%s.json" % (SpecsDir, planetid))
    except:
        planetdata = readfile_py("%s/specs_10000.json" % SpecsDir)
    #editspecs = planetor.product(planetdata)
    data = planetor.product(json.loads(planetdata))
    return JsonResponse(data)

def readfile_py(filename):
    f = open(filename, "rb")
    data = f.read()
    f.close()
    return data

def writefile_py(filename, data):
    f = open(filename, "wb")
    f.write(data)
    f.close()
    return data

def editplanet(request):
    return render(request, 'planetor/editplanet.html')

def collection(request):
    return render(request, 'planetor/collection.html')

def myplanets(request):
    return render(request, 'planetor/myplanets.html')

def generateplanet(request):
    return render(request, 'planetor/generateplanet.html')

def mygallery(request):
    return render(request, 'planetor/mygallery.html')

def shorts(request):
    return render(request, 'planetor/shorts.html')

def allgallery(request):
    return render(request, 'planetor/allgallery.html')

def lifeforms(request):
    return render(request, 'planetor/lifeforms.html')

def browseplanets(request):
    return render(request, 'planetor/browseplanets.html')

def screensaver(request):
    return render(request, 'planetor/screensaver.html')

def exchange(request):
    return render(request, 'planetor/exchange.html')

def images(request):
    return render(request, 'planetor/images/')

def about(request):
    return render(request, 'planetor/about.html')

def logs(request):
    return render(request, 'planetor/out/logs/')

# directory sorted by date modified, newest first
def dirscan_py(directory, mask, count):
    if not os.path.exists(directory):
        return []
    lis = sorted(os.listdir(directory), key=lambda p: -os.stat(directory+'/'+p).st_mtime)
    rval = []
    got = 0
    for filename in lis:
        if re.search(mask, filename):
            rval.append(filename)
            got = got + 1
            if got > count:
                break
    return rval 

def dirlist_py(directory, mask, count=99999999):  #ajax: /dirlist?directory=stills&filemask=*.gif
    lis = os.listdir(directory)
    rval = []
    got = 0
    count = int(count)
    for filename in lis:
        if re.search(mask, filename):
            rval.append(filename)
            got = got + 1
            if got > count:
                break
    return rval

def dirlist(request):  #ajax: /dirlist?directory=stills&filemask=*.gif
    selections = request.GET
    rval = dirlist_py(selections['directory'], selections['mask'], selections['count'])
    return JsonResponse({"files":rval})

def dirscan(request):  #ajax: /dirlist?directory=stills&filemask=*.gif
    selections = request.GET
    rval = dirscan_py(selections['directory'], selections['mask'], selections['count'])
    return JsonResponse({"files":rval})

def randomfile_py(directory, mask, count = 100):
    lis = dirlist_py(directory, mask)
    if len(lis) < 3:
        return []
    rval = []
    planets = len(lis)
    while(planets > 0 and len(rval) < count):
        ran = random.randint(0, planets-1)
        rval.append(lis[ran])
        del lis[ran] # prevent duplicates
        planets = len(lis)
    return rval

def randomfile(request): # only the file name is delivered, not the entire path of the file 
    params = request.GET
    filenames = randomfile_py(params['directory'], params['mask'], int(params['count']))
    #print(filenames)
    return JsonResponse({"data":filenames})

def randomline_py(filename):
    f = open(filename, "r")
    data = f.read()
    f.close()
    list = re.split("[\r\n]+", data)
    return list[random.randint(0, len(list) - 1)]

def gallery(request):
    selections = request.GET
    print("SELECTIONS:"+selections['count']);
    count = int(selections['count'])
    files = dirscan_py(selections['directory'], selections['mask'], count)
    tags = []
    still = None
    editspec = None
    for file in files:
        stuff = re.findall("[0-9a-f-]{36}", file)
        id = stuff[0]
        specsfile = "%s/specs_%s.json" % (SpecsDir, id)
        try:
            editspec = json.loads(readfile_py(specsfile))
            still = "%s/planet_%s.gif" % (StillsDir, id)
        except Exception as e:
            print("JSON error %s with file %s" % (e, specsfile))
            continue; # missing file, don't use this one
        mp4 = "%s/planet_%s.mp4" % (GalleryDir, id)
        tags.append({"id":id,"editspec":editspec,"still":still,"mp4":mp4})
    return JsonResponse({"tags":tags})

def randomgallery(request):
    selections = request.GET
    count = int(selections.get('count') or "100")
    files = randomfile_py(selections['directory'], selections['mask'], count)
    if len(files) < 2:
        return JsonResponse({"tags":[]})
    tags = []
    still = None
    editspec = None
    for file in files:
        stuff = re.findall("[0-9a-f-]{36}", file)
        id = stuff[0]
        try:
            editspec = json.loads(readfile_py("%s/specs_%s.json" % (SpecsDir, id)))
            still = "%s/planet_%s.gif" % (StillsDir, id)
        except Exception as e:
            print("Error %s with planet %s" % (e, file))
            continue; # missing file, don't use this one
        mp4 = "%s/planet_%s.mp4" % (GalleryDir, id)
        tags.append({"id":id,"editspec":editspec,"still":still,"mp4":mp4})
    return JsonResponse({"tags":tags})

def deleteplanet(request):
    selections = request.GET
    id = selections['id']
    try:
        os.remove("%s/specs_%s.json" % (SpecsDir, id))
    except:
        pass
    
    try:
        os.remove("%s/planet_%s.gif" % (StillsDir, id))
    except:
        pass
                  
    try:
        os.remove("%s/planet_%s.mp4" % (GalleryDir, id))
    except:
        pass
                  
    return JsonResponse({"result": id})

NewUserTemplate = {
    "userid":[],
    "handles":[],
    "emails":[],
    "planets":[],
    "activity":{
        "first":"",
        "last":"",
        "times":[],
    },
    "wallets": {
        "BNB":[],
        "ETH":[],
        "AVAX":[],
        "FTM":[],
        "MATIC":[]
    }
}

def gameTime(format = "%H:%M:%S"):
    return time.strftime(format, time.time())

def sendMessage_py(userid, message):
    data = []
    try:
        data = json.loads(readfile_py("%s/%s.json" % (MessagesDir, userid)))
    except:
        pass # not a problem if the file doesn't exist
    data.append("%s: %s", ( gameTime(), message))
    writefile_py("%s/%s.json" % (MessagesDir, userid), bytes(json.dumps(data, indent=4), 'utf-8'))

def getMessages(request):
    messages  = getMessages_py(request.GET.get('user'), request.GET.get('clear'))
    return JsonResponse({"data":messages})

def getMessages_py(userid, clear):
    data = []
    try:
        data = json.loads(readfile_py("%s/%s.json" % (MessagesDir, userid)))
        if clear:
            os.remove("%s/%s.json" % (MessagesDir, userid))
    except:
        pass # not a problem if the file doesn't exist
    return data

def dbread(request):
    params = request.GET
    data = planetor.DbRead(params['table'], params['row'])
    return JsonResponse({"read":data})

@csrf_exempt
def dbupdate(request):
    params = json.loads(request.body)
    #print("REQUEST BODY:%s" % request.body)
    #print("UPDATE:%s,%s,%s" % (params.get('table'), params.get('row'), params.get('branch')))
    data = planetor.DbUpdate(params['table'], params['row'], params['branch'], params.get('ovewrite'))
    return JsonResponse({"updated": data})

def dbdelete(request):
    params = request.GET
    data = planetor.DbDelete(params['table'], params['row'])
    return JsonResponse({"deleted":data})

def filefetch(request):
    params = request.GET
    path = params.get("path")
    mime = params.get("mime")
    # Path to the image file on your server

    print(path);
    # Open the image in binary mode
    try:
        image_file = open(path, 'rb')
    except Exception as e:
        return JsonResponse({"error":str(ex)})
        
    # Return the image using FileResponse
    return FileResponse(image_file, content_type=mime)

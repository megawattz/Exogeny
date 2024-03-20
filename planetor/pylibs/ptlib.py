import os
import sys
import time
import subprocess
import planetor
import re
import json
import sys
import traceback
import mimetypes
import threading

def generate_planet(request):
    selections = request.GET
    res = planetor.generate(selections, "/app/planetor", "FRAMES=1")
    return JsonResponse(res)

def readfile(filename):
    f = open(filename, "rb")
    data = f.read()
    f.close()
    return data

def show(*args):
    print(*args)

def echo(*args):
    return args

def dirlist(directory, mask='.*', max=-1):
    list = os.listdir(directory)
    rval = []
    for filename in list:
        if re.search(mask, filename):
            rval.append(filename)
        max = max - 1
        if max == 0:
            break
    return rval

def gallery(directory = "gallery", mask = 'mp4$', count = 10, width="50%"):
    files = dirlist(directory, mask, count)
    tags = []
    for file in files:
        stuff = re.findall("[0-9]+", file)
        id = stuff[0]
        data = str(readfile("/app/editspecs/edit_%s.json" % id), 'utf-8')
        still = "/stills/planet_%s.gif" % id
        mp4 =  "/gallery/planet_%s.mp4" % id
        tag = '<video id="%s" muted width="%s" src="%s" onclick="editplanet(%s)" preload="none" poster="%s" data-specs=\'%s\' onmouseout="pause()" onmouseover="play()"></video>' % (id, width, mp4, id, still, data)
        tags.append(tag)
        count = count - 1
        if count < 1:
            break
    return ''.join(tags)

# everything should return python except this which translates into JSON for consumption by html and javascript
def tojson(stuff):
    try:
        rval = json.dumps(stuff)
        return rval
    except Exception as e:
        return json.dumps(str(e))

NewUserTemplate = {
    "userid":[],
    "handles":[],
    "emails":[],
    "planets":[],
    "activity":{
        "first":"",
        "last":"",
        "times":"",
    },
    "wallets": {
        "ETH":"",
        "AVAX":"",
        "FTM":"",
        "BNB":""
    }
}

UserDir = "users"
    
def userdata(userid):
    data = {}
    try:
        data = json.loads(readfile("../%s/%s" % (UserDir, userid)))
    except e:
        data = NewUserTemplate
        data['userid'] = userid
        data['handles'] = ['planeteer_0_%s' % userid]
        writefile("../%s/%s" % (UserDir, json.dumps(data)))
    return data

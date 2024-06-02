#!/usr/bin/env python3

# git_info_long: project:git@github.com:programmedtorun/planet_site.git branch:threading_server hash:71e8c89 tag:
# put scene right at top so error message line numbers about the scene roughly correspond to this python program line numbers

import os
import time
import sys
import random
import re
import math
import subprocess
import copy
import json
import shlex
import inspect
import uuid
import pathlib

Scene = ""
Options = {}
false = False
true = True

def moon(index, start_angle, atmosphere, template, factor, moon_size, planet_size, mdistance, tilt = 0 ): # which moon
    speed = pow(2, index)
    moon_data = readfile("/app/planetor/moons/"+template).decode()
    #print("MOON:%s) %s %s" % (index, mdistance, moon_size))
    moon_template = moon_data % (index, speed, start_angle, atmosphere, moon_size, planet_size, mdistance, tilt)
    return (expand_vars(moon_template, Options), mdistance)

def ring(ring_color, radius, hole, brightness, index, options, template):
    planet_size = options['planet_size']
    print("RING: hole:%s radius:%s bright:%s" % (hole, radius, brightness))
    ring_data = readfile("/app/planetor/rings/"+template).decode()
    #print("RING_DATA:"+ring_data)
    ring_template = ring_data % (ring_color, radius, hole, brightness, index, planet_size)
    return expand_vars(ring_template, options)

def resolve_parameter(name, value, options):
    # some parameters cannot be used directly but need to be translated into
    # images for example, atmospheric gas names need to be translated into
    # color values, chlorine=green, sulfur-dioxide=yellow etc
    if value == "":
        value = None; # consider empty string == None

    if (name == "scene"):
        rfile = value or randomfile("scenes", ".*.tov")
        options['scene'] = rfile
        return options['scene']
    
    if (name == "background"):
        rfile = value or randomfile("backgrounds")
        options['background'] = rfile
        return options['background']
    
    elif (name == "planet"):
        rfile = value or randomfiletypeexp("surfaces", 1.5, ["ice","glaciated","aquatic","gas_giant","aquatic","rocky","volcanic","desert","oceanic","forest","terrestrial"])
        #rfile = value or randomfile("surfaces")
        options['planet'] = rfile
        root = re.findall('[a-zA-Z_]+', rfile)
        name = re.sub('_', '', root[0])
        options['planet_type'] = name
        return options['planet']
    
    elif (name == "planet_spec"):
        rfile = value or resolve_parameter("planet", options.get('planet'), options)
        return '%s "%s"' % (file_type(rfile), rfile)
    
    elif (name == "clouds"):
        rfile = value or randomfile("clouds")
        options['clouds'] = rfile
        return options['clouds']
    
    elif (name == "clouds_spec"):
        rfile = resolve_parameter("clouds", options.get('clouds'), options)
        return '%s "%s"' % (file_type(rfile), rfile)
    
    elif (name == "atmosphere_composition"):
        gases = [
            "carbon_dioxide",
            "sulfur_dioxide",
            "nitrous_oxide",
            "krypton",
            "hydrogen_iodide",
            "hydrogen_chloride",
            "hydrogen_bromide",
            "argon",
            "TFNM",
            "acetylene",
            "nitrosyl_bromide",
            "neon",
            "bromine",
            "water_vapor",
            "nitrogen_dioxide",
            "ammonia",
            "iodine",
            "chlorine",
            "ozone",
            "nitrogen",
            "oxygen",
        ]
        gas = value or exprandomline(gases, 1.2)
        color = atmoscolor(gas, 20)
        options['atmosphere'] = color
        options['atmosphere_composition'] = gas
        return options['atmosphere_composition']
    
    if value != None and value != "":
        return value

    if (name == "sun_brightness"):
        bright = randomlist([3, 6, 9])
        options['sun_brightness'] = value or "%d,%d,%d" % (bright, bright, bright)
        return options['sun_brightness']
    elif (name == "rings"):
        camdist = pythag(ttol(options['camera_location']))
        if value == None:
            options['rings'] = randomint(3, int(camdist/15))
        elif int(value) == 0 and camdist >= 110:
            options['rings'] = randomint(3, int(camdist/15))
        elif int(value) > 0:
            options['rings'] = int(value)
        return options['rings']
    elif (name == "ring_brightness"):
        options['ring_brightness'] = value or str(randomfloat(0.70, 0.95))
        return options['ring_brightness']
    elif (name == "ring_template"):
        rfile = value or randomfile("rings", ".*.tov")
        options['ring_template'] = rfile
        return rfile
    elif (name == "atmosphere"):
        options['atmosphere'] = value or options['atmosphere'] or randomcolor()
        return options['atmosphere']
    elif (name == "planet_size"):
        options['planet_size'] = str(value or randomint(14,30))
        return options['planet_size']
    elif (name == "clouds_size"):
        options['clouds_size'] = "1.003"
        return options['clouds_size']
    elif (name == "clouds_density"):
        if 'trans' in options['clouds']:
            options['clouds_density'] = str(value or randomfloat(0.0, 0.2))
        else:
            options['clouds_density'] = str(value or randomfloat(0.5, 0.85))
        return options['clouds_density']
    elif (name == "atmosphere_density"):
        options['atmosphere_density'] = str(value or randomfloat(0.70, 0.95))
        return options['atmosphere_density']
    elif (name == "evaluation"):
        options['evaluation'] = value or randomline("names/evaluations.txt")
        return options['evaluation']
    elif (name == "evaluation2"):
        options['evaluation2'] = value or randomline("names/evaluations.txt")
        return options['evaluation2']
    elif (name == "font"):
        options['font'] = value or randomfile("fonts")
        return options['font']
    elif (name == "moons"):
        options['moons'] = int(value or randomint(0, 4))
        return options['moons']
    elif (name == "moon"):
        rfile = randomfile("surfaces")
        return rfile
    elif (name == "moon_template"):
        rfile = value or randomfile("moons", ".*.tov")
        options['moon_template'] = rfile
        return rfile
    elif (name == "moon_spec"):
        rfile = resolve_parameter("moon", options.get("moon"), options)
        return '%s "%s"' % (file_type(rfile), rfile)
    elif (name == "moon_position_by_distance"):
        distance = randomfloat(10, 30)
        leg = sqrt(distance^2/2) # get two sides of right triangle were distance is the hypotenuse
        return "%f,%f,%f" % (-leg,0,-leg)
    elif (name == "moon_position"):
        distance = value or str(randomfloat(10, 30))
        options['moon_position'] = distance
        return "%f,%f,%f" % (-float(distance), 0, -float(distance))
    elif (name == 'moon_size'):
        return  str(randomfloat(0.2, 0.8))
    elif (name == "random_color"):
        return randomcolor(1)
    elif (name == "random_float"):
        return str(randomfloat(0, 1))
    elif (name == "random_trans"):
        return str(randomfloat(0.9, 0.99))
    elif (name == "planet_index"):
        options['planet_index'] = value or systemnames()[2]
        return options['planet_index']
    elif (name == "star_system"):
        options['star_system'] = value or systemnames()[0]
        return options['star_system']
    elif (name == "star_index"):
        options['star_index'] = str(value or systemnames()[1])
        return options['star_index']
    elif (name == "designation"):
        options['designation'] = value or expand_vars("v_star_index v_star_system v_planet_index", options)
        return options['designation']
    elif (name == "camera_angle"):
        options['camera_angle'] = value or str(randomint(-90, 90))
        return options['camera_angle']
    elif (name == "camera_location"):   
        options['camera_location'] = value or "%d,%d,%d" % ( randompick(randomint(-100, -20), randomint(20, 100), 50), randompick(randomint(-100, -20), randomint(20, 100), 50), randompick(randomint(-100, -20), randomint(20, 100), 50) )
        return options['camera_location'] 
    elif (name == "camera_look_at"):
        options['camera_look_at'] = value or randomlist(["0,0,0","0,-10,0"])
        return options['camera_look_at']
    elif (name == "identity"):
        options['identity'] = value or str(uuid.uuid4())
        return options['identity']
    elif (name == "chemistry"):
        options['chemistry'] = value or exprandomline(Chemistry, 1.6)
        return options['chemistry']
    elif (name == "lifeform"):
        planet_type = options.get('planet_type')
        if planet_type and planet_type == "aquatic":
            options['lifeform'] = randomlist(["Cephalapoid","Aquatic"])
        else:
            #options['lifeform'] = value or exprandomline(LifeForms, 1.0)
            options['lifeform'] = value or exprandomline(LifeForms, 1.4)
        return options['lifeform']
    elif (name == "artist"):
        options['artist'] = value or randomfile("artists")
        return options['artist']
    elif (name == "audio"):
        options['audio'] = value or randomfile("audio", ".*.mp3")
        return options['audio']
    elif (name == "unexplored"):
        options['unexplored'] = value or str(randomint(0, 1))
        return options['unexplored']
    
    return str(value)

def expand_vars(template, dic):
    result = re.sub(r'v_([a-z_]+)(?![a-z_])', lambda match: resolve_parameter(match.group(1), dic.get(match.group(1)), dic), template)
    return result

def randompick(iftrue, ifnot, prob):
    if randomint(0, 100) < prob:
        return iftrue
    return ifnot

def randomint(low,high):
    return random.randint(low, high)

def randomfile(directory, mask='.*'):
    files = list(filter(lambda f: re.match(mask, f), os.listdir(directory)))
    return files[random.randint(0, len(files) - 1)]

def randomfiletypeexp(directory, skew = 1.2, categories = ["ice","glaciated","aquatic","gas_giant","aquatic","rocky","volcanic","desert","oceanic","forest","terrestrial"]):
    category = exprandomline(categories, skew)
    return randomfile(directory, ".*%s.*" % category)

def randomloc(xrange, yrange, zrange):
    return "%d,%d,%d" % (random.randint(-xrange, xrange),random.randint(-yrange, yrange),random.randint(-zrange, zrange))

def randomfloat(low, high):
    return round(random.uniform(low, high), 2)

def randomcolor(bright = 1.0, filter = 0):
    return "%.2f, %.2f, %.2f" % (randomfloat(0.0,0.99)*bright, randomfloat(0.0,0.99)*bright, randomfloat(0.0,0.99)*bright)

def countfiles(directory, mask='.*'):
    try:
        files = list(filter(lambda f: re.match(mask, f), os.listdir(directory)))
        return len(files)
    except ex:
        print(f"countfiles {directory}/{mask}: {ex}")
        return 0

def blendcolors(color1str, color2str):
    color1 = ttol(color1str)
    color2 = ttol(color2str)
    newcolor = color1
    for index in range(0, 2):
        newcolor[index] = (float(color1[index])+float(color2[index]))/2;
    return ltot(newcolor)

def ltot(list): # list to text = [1, 2, 3] = "1, 2, 3"
    strlist = []
    for v in list:
        strlist.append(str(v)) # list elements need to be strings
    return ",".join(strlist)

def ttol(txt): # test to list = "1,2,3" = [1, 2, 3]
   return re.split("[^0-9.-]+", txt)

Atmospheres = {
    "chlorine":"0.22, 1.71, 1.26", # blue green
    "sulfur_dioxide":"2.49, 1.54, 0.11", # light orange
    "nitrous_oxide":"0.63, 1.85, 0.85", # light green
    "krypton":"1.56, 0.86, 1.19", # light magenta
    "hydrogen_iodide":"1.65, 0.62, 2.19", # purple
    "hydrogen_chloride":"1.46, 2.07, 1.73",  # sea foam green
    "nitrogen":"1.79, 1.44, 2.41", # lavender
    "hydrogen_bromide":"2.38, 0.52, 1.43",  # pink
    "argon":"1.56, 0.71, 2.28",  # light purple
    "acetylene":"1.69, 0.54, 0.01",  # orange
    "phosphine":"1.47, 2.18, 1.72", # aqua
    "neon": "2.53, 1.62, 0.04", # orange
    "nitrogen_dioxide":"2.38, 1.73, 1.46", # peach
    "bromine":"2.37, 0.44, 0.26", # scarlet
    "iodine":"2.5, 1.5, 2.5",  # thistle
    "carbon_dioxide":"1.40, 0.81, 0.36", # brown
    "ammonia":"1.33, 1.70, 2.5",   # sky blue
    "ozone": "0.88, 2.24, 2.5", # powder blue
    "water_vapor":"0.9, 1.2, 1.7", # baby blue
    "oxygen":"0, 0.96, 1.88", # dark blue
    "TFNM":"0.23, 0.49, 1.21", # dark blue
    "nitrosyl_bromide":"1.74, 0.11, 0.01" # deep red
}

def atmoscolor(gas, fuzzfactor = 30):
    color = Atmospheres.get(gas) or randomcolor()
    atmos = ttol(color)
    newcolor = fuzz(atmos, fuzzfactor) # split atmosphere number string into list of 3 floats
    return ltot(newcolor)

def extract_id(str):
    stuff = re.findall("[0-9]{3,}", str)
    return stuff[0]

def randomlist(list):
    index = random.randint(0, len(list) - 1)
    return list[index]

def randomdict(dict):
    key = randomlist(list(dict.keys()))
    return key

def fuzz(values, percentage): # vary a value by a certain random percentage (used to get "similar" things)
    fuzzed = []
    for i in range(0, len(values)):
        v = float(values[i])
        fuzzed.append(round(v + (v * random.uniform(-percentage, percentage)/100), 2))
    return fuzzed

def readfile(path):
    f = open(path, "rb")
    data = f.read()
    f.close()
    return data

def writefile(path, data):
    dir, file = os.path.split(path)
    if not os.path.exists(dir):
        os.mkdir(dir)
    f = open(path, "wb")
    f.write(bytes(data, 'utf-8'))
    f.close()
    return data

def randomline(filename):
    f = open(filename, "r")
    data = f.read()
    f.close()
    list = re.split("[\r\n]+", data)
    return list[random.randint(0, len(list) - 2)]

def filelines(filename):
    try:
        f = open(filename, "r")
        data = f.read()
        f.close()
    except:
        return []
    return re.split("[\r\n]+", data)

def systemnames():
    greeks = filelines("names/greeks.txt")
    romans = filelines("names/romans.txt")
    systems = filelines("names/systems.txt")
    
    index = countfiles("out/specs/", '.*[.]json$')
    print(f"INDEX: {index}")
    count = 0
    
    for system in systems:
        for greek in greeks:
            for roman in romans:
                if count >= index:
                    print(f"INDEX: {index} NAME: {greek} {system} {roman}")
                    return [system, greek, roman]
                count += 1
    raise Exception(f"too many planets {index} not enough greeks, romans and systems")

# reads a random element from a list, exponential distribution on base
# each element in the list is base times more likely to get picked than the previous element
def exprandomline(list, base = 2):
    max = math.floor(pow(base, len(list)))
    choice = random.randint(0, max)
    try:
        item = math.trunc(math.log(choice, base))
    except Exception as e: # log of 0 not possible so just choose most common choice
        item = len(list)-1
    return list[item]

def file_type(file):
    parts = os.path.splitext(file)
    types = {'.jpg':'jpeg'}
    if parts[1] in types:
        return types[parts[1]]
    return parts[1][1:]

def message(*args):
    pass
    for arg in args:
        sys.stderr.write(str(arg))
    sys.stderr.write("\n\n")

def print_where(*args):
    caller = inspect.currentframe().f_back.f_back.f_back.f_back.f_back
    sys.stderr.write(caller.f_code.co_name+": ")
    for arg in args:
        sys.stderr.write(str(arg))
    sys.stderr.write("\n\n")
    
def parse_query(query):
    selections = {}
    if query is None:
        return selections
    if len(query) < 1:
        return selections
    elements = dict(pair.split('=') for pair in query.split('&'))
    for k,v in elements.items():
        if v == "":
            v = None
        selections[k] = v
    return selections

def lineprint(text):
    return ""
    lines = re.split("[\r\n]", text)
    for i in range(1, len(lines)):
        message("%3d:%s" % (i, lines[i-1]))

def execstring(command):
    # shlex supposedly escape special characters so users can't pass sneaking shell parameters
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)

    output = ""
    while p.poll() is None:
        temp = p.stdout.read()
        message(temp)
        try:
            output += temp.decode("utf-8", errors='replace')
        except:
            output += temp.decode("string_escape", errors='replace')

    return output

user_selectables = [
    "identity",
    "star_index",
    "star_system",
    "planet_index",
    "evaluation",
    "evaluation2",
    "scene",
    "sun_brightness",
    "camera_angle",
    "camera_location",
    "camera_look_at",
    "planet_size",
    "planet",
    "clouds",
    "clouds_density",
    "atmosphere_composition",
    "atmosphere_density",
    "background",
    "rings",
    "ring_template",
    "ring_brightness",
    "moons",
    "moon_template",
    "lifeform",
    "unexplored",
    "artist",
    "audio"
]

def product(options):
    selectables = {
        "checkboxes": {},
        "identity": options['identity']
    }
    selects = selectables['checkboxes']
    for name in user_selectables:
        selects[name] = options.get(name) or "0"
    return selectables

def lesser(val1, val2):
    if val1 < val2:
        return val1
    return val2

def greater(val1, val2):
    if val1 > val2:
        return val1
    return val2

def make_query(selectables):
    query = ""
    for name in selectables:
        value = Options[name]
        if value == None:
            value = ""
        query += '%s=%s&' % (name, value)
    return query

Chemistry = ['carbon','ammonia','arsenic','borane','hydrogen_sulfide','methane','silicon','sulfur','retinal']
LifeForms = ['Gaseous','Plant','Blob','Fungoid','Cephalapoid','Aquatic','Aerial','Insectoid','Human','Reptilian','Humanoid','Quadruped']

# Database Operations (the file backing store will be replaced with Redis or Mongo)
DatabaseDirectory = "/app/planetor/out"

DbDefaults = {
    "user": {
        "id":"",
        "handles":[],
        "emails":[],
        "planets":[],
        "activity":{
            "first":0,
            "last":0,
            "times":[],
        },
        "planets": [
            "10000"
        ]
    },
    "specs": {
        "id":"",
        "scene": None,
        "camera_location": "%d,%d,%d" % (randomint(-100, -30), randomint(-100, -30), randomint(-100, -30)),
        "camera_angle": randomlist(["45","-45"]),
        "camera_look_at": "0, 0, 0",
        "sun_brightness": "6,6,6",
        "planet_size": None,
        "background": "background_9.jpg",
        "planet": "planet_3.jpg",
        "clouds_size": "1.01",
        "clouds": "clouds_11.jpg",
        "clouds_density": "0.42",
        "atmosphere":None,
        "atmosphere_composition": None,
        "atmosphere_density": "0.80",
        "atmosphere_size": "1.02",
        "moons": 0,
        "moon_position": None,
        "moon_size": None,
        "moon": None,
        "rings": 0,
        "ring_brightness": None,
        "random_color": None,
        "random_float": None,
        "random_trans": None,
        "star_system": "Sol",
        "star_index": "Alpha",
        "planet_index": "III",
        "evaluation": None,
        "evaluation2": None,
        "identity": None,
        "lifeform": None,
        "chemistry": None,
        "planet_type": "planet",
        "unexplored": "1",
        "artist":"anonymous.png",
        "audio": "None.mp3"
    }
}

def DbRead(table, row):
    path = "%s/%s/%s_%s.json" % (DatabaseDirectory, table, table, row)
    try:
        data = readfile(path).decode()
        rdata = json.loads(data) # convert to Python dictionary
    except Exception as e:  # if this is a new record, give it standard, default values
        rdata = DbDefaults.get(table) or {}
    rdata['id'] = row # set internal id to file id
    #print("RECORD:%s.%s\n%s" % (table, row, rdata))
    return rdata

def DbUpdate(table, row, branch, overwrite=False):
    updated = {}
    data = DbRead(table, row)
    #print("READ:%s.%s=%s" % (table, row, data))
    if not overwrite:
        updated = data | branch
    else:
       updated = branch
    updated['id'] = row
    #print("UPDATED:%s.%s=%s" % (table, row, updated))
    path = "%s/%s/%s_%s.json" % (DatabaseDirectory, table, table, row)
    writefile(path, json.dumps(updated, indent=4))
    return updated

def DbDelete(table, row):
    path = "%s/%s/%s_%s.json" % (DatabaseDirectory, table, table, row)
    return os.remove(path)

def civilization(identity, options):
    civilization = {
        "identity": identity,
        "name": options.get("planets") or randomline("names/planets.txt"),
        "motto": options.get("motto") or randomline("names/mottos.txt"),
        "species": options.get("species") or randomline("names/species.txt"),
        "culture": options.get("culture") or randomline("names/culture.txt"),
        "generation": options.get("generation") or 0,

        # generated assets
        "infrastructure": options.get("infrastructure") or 0,
        "manufactured": options.get("manufactured") or 0,
        "services": options.get("services") or 0,
        "entertainment": options.get("entertainment") or 0,
        "woo": options.get("woo") or 0,
        "happiness": options.get("happiness") or 0,
        "population": options.get("population") or 0,
        "tritanium44": options.get("tritanium44") or 0,

        # tech levels
        "bio":options.get("bio") or 0,
        "energy":options.get("energy") or 0,
        "information":options.get("information") or 0,
        "engineering":options.get("engineering") or 0,
        "science":options.get("science") or 0,
        "transport":options.get("transport") or 0,
        "social":options.get("social") or 0,
        "warfare":options.get("warfare") or 0,
        "economic":options.get("econonomic") or 0,
        "spiritual":options.get("spiritual") or 0,
        "art":options.get("art") or 0,
    }
    return civilization

# default options. Empty values generate an appropriate random value
def DefaultOptions():
    return {
        "scene": None,
        "camera_angle": randomlist(["45","-45"]),
        "camera_look_at": '0,0,0',
        "sun_brightness": '6,6,6',
        "camera_location":  "-40,-40,-40",
        "planet_size": 20,
        "background": None,
        "planet": None,
        "planet_size": None,
        "clouds_size": "1.01",
        "clouds": None,
        "clouds_density": None,
        "atmosphere":None,
        "atmosphere_composition":None,
        "atmosphere_density": "0.80",
        "atmosphere_size": "1.02",
        "rings": 0,
        "ring_brightness": "0.90",
        "ring_template":None,
        "moons": 0,
        "moon_position": None,
        "moon_size": None,
        "moon": None,
        "moon_template": "slow.tov",
        "random_color":None,
        "random_float":None,
        "random_trans":None,
        "star_system":None,
        "star_index":None,
        "planet_index":None,
        "evaluation": None,
        "evaluation2": None,
        "planet_type":None,
        "identity":None,
        "chemistry": None,
        "lifeform": None,
        "rare": randomfloat(0,2),
        "radioactives": 0,
        "refractories": 0,
        "industrials": 0,
        "specialized": 0,
        "biologicals": 0,
        "exotics": 0,
        "relics": 0,
        "unexplored": "1",
        "artist":"anonymous.png",
        "audio": "None.mp3"
    }

def pythag(list):  # pythagoean distance in N dimensions
    total = 0
    for v in list:
        total += pow(float(v), 2)  # sum the squares
    return pow(total, 0.5)  # square root

def isnear(check, against, amount):
    if (check - against) < amount:
        return True
    return False

def appendToOptionValue(key, append, spacer=''):
    Options[key] = Options.get(key) or "" + spacer + append;

def addEvaluation(options):
    # if creator did not specify a evaluation, attempt to derive one
    # if unexplored, that is it's only evaluation
    if options.get("unexplored") != "0":
        options['evaluation'] = 'Unexplored'
        return options
    
    options['evaluation'] = resolve_parameter("evaluation", options.get("evaluation"), options)

    options['evaluation2'] = resolve_parameter("evaluation2", options.get("evaluation2"), options)

    #while options['evaluation2'] == options['evaluation']:  # avoid duplicates
        #options['evaluation2'] = resolve_parameter("evaluation2", options.get("evaluation2"), options)

    return options
    
def addrings(camera_location, ring_count, planet_size, atmosphere, options, moons):
    print("MOONS: %s" % moons);
    ring_brightness = float(resolve_parameter("ring_brightness", Options.get("ring_brightness"), Options)) * randomfloat(1, 1.5)    
    ring_template = options["ring_template"]
    ring_scene = ""
    ring_radius = planet_size * randomfloat(1.2, 2.2) # these need to be persistent during generation of rings to prevent overap
    hole_radius = 0
    step = randomfloat(1, 4)
    atmos = ttol(atmosphere)
    padding = 2
    index = 1
    while index <= ring_count:  # randomly alter colors 
        atmos = fuzz(atmos, 5) # split atmosphere number string into list of 3 floats
        #if len(atmos) < 4:  # make the rings taper off by getting more transparent
            #atmos.append(m * .15)
        temp = ring_radius + randomfloat(step*index/3, step*index/2) # need to use this to calculate hole radius
        hole_radius = ring_radius + randomfloat( -2, 1) # let rings overlap for more variety
        ring_radius = temp
        basecolor = ltot(atmos)
        color = blendcolors(basecolor, randomcolor(1.3))
        # don't put a ring where a moon is orbiting
        ismoon = False
        for moon_orbit, moon_size in moons.items():
            #if ring_radius > (moon_orbit-moon_size-1) and (moon_orbit+moon_size+1) >= hole_radius:
            #if (ring_radius > moon_orbit-1) and (moon_orbit+1) >= hole_radius:
            if (moon_orbit + moon_size + 2) > hole_radius and (moon_orbit - moon_size - 2) < ring_radius:
                ring_radius += moon_size
                hole_radius += moon_size
                ismoon = True;
                break
        if ismoon:
            continue
        else:
            index = index + 1
        brightness = 0.99 #ring_brightness + randomfloat(0.01, 0.2) #                                                    * int(randomlist([-1, 1]))
        ring_scene += ring(basecolor, ring_radius, hole_radius, brightness, index, options, ring_template)
    return ring_scene

def help():
    message("pass planet creation arguments as an HTTP query string, example:")
    message("./generate.py 'background=stars_2.png&size=5&clouds=&surface=&atmosphere=chlorine&density=0.5'")
    message("or as a QUERY_STRING environment variable (for use as a cgi script)")
    message("set QUERY_STRING='background=stars_2.png&size=5&clouds=&surface=&atmosphere=chlorine&density=0.5'")
    message(" ./generate.py")
    sys.exit(0)
    
def generate(selections, directory = "./", env = "FRAMES=200", wait=False): # as a dictionary 
    print("-----------------")
    os.chdir(directory)
    random.seed(os.getpid() * time.time())

    message("Selections:%s" % json.dumps(selections))
    message("env: %s" % env)
    
    Options = {}
    Options = copy.deepcopy(DefaultOptions())

    Options['resources_value'] = 0.0
    for k, v in {"rare":6,"radioactives":12,"refractories":25,"industrials":100,"specialized":8,"biologicals":50,"exotics":2,"relics":1}.items():
        Options[k] = randomfloat(0, v)
        Options['resources_value'] += float(Options[k]) * (100/v)    # weight adjusted
    Options['resources_value'] = round(Options['resources_value'], 0)
    
    for k, v in selections.items():
       Options[k] = v

    message("Initial Requested:", Options)
    
    identity = resolve_parameter("identity", Options['identity'], Options)

    civ = civilization(identity, selections)
    DbUpdate("civilization", identity, civ)

    # if we have selected to regenrate lifeform image, delete the old one
    if not Options.get('lifeform'):
        lifeform_file = "/app/planetor/out/lifeforms/lifeform_%s.png" % identity
        try:
            print("Removing %s" % lifeform_file)
            os.remove(lifeform_file)
        except Exception as e:
            print("Error removing %s: %s" % (lifeform_file, repr(e)))

    if not Options.get('retry_lifeform') == "keep":
        lifeform_file = "/app/planetor/out/lifeforms/lifeform_%s.png" % identity
        try:
            print("Removing %s" % lifeform_file)
            os.remove(lifeform_file)
        except Exception as e:
            print("Error removing %s: %s" % (lifeform_file, repr(e)))

    # fill in any still empty Options
    for k, v in Options.items():
        Options[k] = resolve_parameter(k, v, Options)
    Options['background'] = resolve_parameter('background', Options['background'], Options)
    Options['created'] = int(time.time())
    # new way, don't store full path
    scene = resolve_parameter("scene", Options["scene"], Options)
    Scene = str(readfile("/app/planetor/scenes/"+scene), 'utf-8')
    
    pov = expand_vars(Scene, Options)

    # pythagorean distance from camera to planet center
    planet_size = int(resolve_parameter("planet_size", Options["planet_size"], Options))
    camdist = pythag(ttol(Options['camera_location'])) - int(Options["planet_size"]) 
    #print("Camera Distance: %s" % camdist)
    Options["moons"] = Options["moons"] or min(4, randomint(0, int(camdist / 30))) # user specified, or based on distance from camera
    moon_template = resolve_parameter("moon_template", Options['moon_template'], Options)
    actual_moons = int(resolve_parameter("moons", Options["moons"], Options))
    max_moons = 4
    # used by both planet, and moons
    atmosphere = resolve_parameter("atmosphere", Options["atmosphere"], Options)
    moon_scene = ""
    color = atmosphere
    moons = {}
    factor = randomfloat(1.8, 2.6)
    mass = randomfloat(0.2, 3)
    for m in range(2, actual_moons + 2):
        moon_size = randomfloat(1, mass)
        mass = mass + moon_size
        color = blendcolors(color, randomcolor(1)) # remodify color so it can progressively drift from the planet color scheme
        mdistance = planet_size + (pow(2.2, m))
        scene, distance = moon(m, randomfloat(0,360), color, moon_template, factor, moon_size, planet_size, mdistance, 0)  # start_moon + 1 is because moons start at 1, but modulo causes moon 0
        moon_scene += scene
        orbit = pythag([distance,distance])
        moons[orbit] = moon_size # make a table of moons and their size
        #print("MOON:%s %s %s" % (m, distance, moon_size))
    pov += moon_scene

    print("OPTIONS:%s" % Options)
    
    camera_location = resolve_parameter("camera_location", Options['camera_location'], Options)
    ring_count = int(resolve_parameter("rings", Options["rings"], Options))
    ring_pov = addrings(camera_location, ring_count, planet_size, atmosphere, Options, moons)

    pov += ring_pov

    addEvaluation(Options)
    
    designation = expand_vars("v_star_index v_star_system v_planet_index", Options)
    description = designation

    povdir = "out/povs"
    if not os.path.exists(povdir):
        os.mkdir(povdir)
    povfile = "%s/%s.pov" % (povdir, identity)
    writefile(povfile, pov)

    logdir = "out/logs"
    if not os.path.exists(logdir):
        os.mkdir(logdir)

    Options['lifeform_image'] = 'lifeform_%s.png' % identity
    specs = DbUpdate("specs", identity, Options)

    povray_command = "%s ./generate.sh '%s' > out/logs/generate_%s.log 2>&1 %s" % (
        env,
        identity,
        identity,
        '' if wait else '&' )
    
    message("PLANETOR COMMAND:%s" % povray_command)

    execstring(povray_command)

    message("PLANETOR DONE:%s" % identity, Options)

    return product(Options)

if __name__ == "__main__":
    selects = ""
    if len(sys.argv) > 1 and not '=' in sys.argv[1]:
        selections = json.loads(readfile(sys.argv[1]))
    else:
        selections = parse_query('&'.join(sys.argv[1:]))
    print("PLANET:"+str(generate(selections, './', "", True)))

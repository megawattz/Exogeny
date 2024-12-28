#!/usr/bin/env python3

import os
import json
import re
import pprint
import shutil

#Iterate gallery, stills, specs, civilizations
#iterate through each and delete any files that aren't in all 4

dirs = ("gallery", "stills", "civilization", "specs", "povs", "lifeforms")

files = {}

def purge(id):
    for dir in dirs:
        if id in files[dir]:
            try:
                print("deleting: %s" % files[dir][id])
            except:
                pass

def extract_id(str):
    stuff = re.findall("[a-fA-F0-9-]{36}", str)
    try:
        return stuff[0]
    except Exception as e:
        print("%s on filename %s" % (e, str))

for dir in dirs:
    files[dir] = {}
    for file in os.listdir(dir):
        files[dir][extract_id(file)] = file

for dir1 in dirs:
    print("--- %s ---" % dir)
    for id in files[dir1]:
        for dir2 in dirs:       # check all the directories for that id
            if not id in files[dir2]:
                fullpath = "%s/%s" % (dir1, files[dir1][id])
                print("missing:%s:%s" % (dir2, id))
                try:
                    print("archiving: %s" % files[dir1][id])
                    shutil.move(fullpath, "/home/woody/Downloads/Planeteer/")
                except Exception as e:
                    print("%s removing %s instead" % (e, fullpath))
                    try:
                        os.remove(fullpath)
                    except Exception as e:
                        print("%s removing %s" % (e, fullpath))

#pprint.pp(files)        
#print(json.loads(files, indent=4))

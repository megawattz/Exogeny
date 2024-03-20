#!/usr/bin/env python3

import os.path
import sys
import json
import ffmpeg
from pprint import pprint

# Remove planets with duplicate designations, keep newest one

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

planetMap = {}

if __name__ == "__main__":
    statii = {'bad_metadata':0, 'duplicate':0, 'processed':0}
    count = 0
    for planetfile in sys.argv[1:]:
        statii['processed'] += 1
        #sys.stderr.write("%s\r" % count)
        #print(planetfile)
        print("%s" % count, end="\r", file=sys.stderr)
        count += 1
        try:
            meta = json.loads(ffmpeg.probe(planetfile).get("format").get("tags").get("comment"))
        except Exception as e:
            print("%s has error %s." % (planetfile, e))
            #os.remove(planetfile);
            statii['bad_metadata'] += 1
            continue;
            
        #print(planetfile)
        #print(meta)
        system = meta.get('star_system')
        greek = meta.get('star_index')
        index = meta.get('planet_index')
        
        current = {}
        fileinfo = os.stat(planetfile)
        current = {"planetfile":planetfile, "fileinfo":fileinfo};
        
        designation = "%s_%s_%s" % (greek, system, index)
        
        previous = planetMap.get(designation)
        if previous:
            if current['fileinfo'].st_mtime < previous['fileinfo'].st_mtime:
                print("%s %s older than %s, removing %s" % (designation, current['planetfile'], previous['planetfile'], current['planetfile']))
                os.remove(current['planetfile']);
                statii['duplicate'] += 1
                continue
            else:
                print("%s %s older than %s, removing %s" % (designation, previous['planetfile'], current['planetfile'], previous['planetfile']))
                statii['duplicate'] += 1
                os.remove(previous['planetfile'])
            
        planetMap[designation] = current

print(statii);
        


    


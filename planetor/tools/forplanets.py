#!/usr/bin/env python3

import os.path
import sys
import json
import ffmpeg
import utils
from pprint import pprint

# Remove planets with duplicate designations, keep newest one

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

Statii = {'bad_metadata':0, 'duplicate':0, 'processed':0}

def foreach(criteria, command):
    count = 0
    files = os.listdir('.');
    for planetfile in files:
        try:
            meta = json.loads(ffmpeg.probe(planetfile).get("format").get("tags").get("comment"))
        except Exception as e:
            print("%s has error %s." % (planetfile, e))
            os.remove(planetfile);
            Statii['bad_metadata'] += 1
            continue;

        hits = {}
        skip = False;
        for attrib in criteria:
            if meta[attrib] != criteria[attrib]:
                skip = True;
                break;
            hits[attrib] = meta[attrib];
        if skip:
            continue;
        
        Statii['processed'] += 1
        print("%s" % count, end="\r", file=sys.stderr)
        count += 1

        print("%s" % hits)
        executor = command.replace('@', planetfile);
        executor = executor.replace('#', meta["id"]);
        print(executor)
        os.system(executor)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("forplanets.py attribute=value attribute=value shellcommand arg arg arg")
        print("usage example: ipfsjson.py unexplored=true planet_size=22 mv @ ../archive")
        sys.exit(0);

    criteria, arguments = utils.fetchArgs(sys.argv[1:], docs= {
        "id": "example: 323068046",
        "planet_size": "example: 21",
        "camera_location": "40,40,40",
        "camera_angle": "120",
        "camera_look_at": "20,10,-20",
        "sun_brightness": "5,5,5",
        "sun_position": "10000,10000,10000",
        "background": "preview_3.jpg",
        "planet": "terrestial_4.png",
        "clouds_size": "1.01",
        "clouds": "clouds_42.jpg",
        "clouds_density": "0.87",
        "atmosphere": "0.44,1.05,1.63",
        "atmosphere_composition": "helium",
        "atmosphere_density": "0.98",
        "atmosphere_size": "1.03",
        "moons": "1",
        "moon_position": "-27.790000,0.000000,-27.790000",
        "moon_size": "1.34",
        "moon": "gas_giant_4.jpg",
        "rings": "0",
        "random_color": "0.56, 0.45, 0.05",
        "random_float": "0.68",
        "random_trans": "0.97",
        "star_system": "Lowell",
        "star_index": "Gamma",
        "planet_index": "XII",
        "evaluation": "Unexplored",
        "evaluation2": "Fertile",
        "identity": "323068046",
        "lifeform": "Reptilian",
        "chemistry": "halogen",
        "planet_type": "terrestial",
        "unexplored": "true",
        "artist": "Woody",
        "rare": "4.07",
        "radioactives": "3.33",
        "refractories": "15.35",
        "industrials": "36.09",
        "specialized": "2.5",
        "biologicals": "7.3",
        "exotics": "0.76",
        "relics": "0.73",
        "resources_value": "349.92",
        "created": "1672897103"
    })
       
    command = ' '.join(arguments);

    foreach(criteria, command)

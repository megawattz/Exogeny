#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
from pprint import pprint

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

if __name__ == "__main__":
    for planet in sys.argv[1:]:
        try:
            meta = ffmpeg.probe(planet).get("format").get("tags").get("comment")
            print(planet)
            print(meta)
        except Exception as e:
            print("%s %s" % (e, planet))
        #identity = planetor.extract_id(planet)
        #civ = planetor.civilization(identity, {})

        


    


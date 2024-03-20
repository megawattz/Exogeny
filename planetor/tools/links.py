#!/usr/bin/env python3

import os.path
import sys
import json
import ffmpeg
from pprint import pprint

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

if __name__ == "__main__":
    for planet in sys.argv[1:]:
        meta = json.loads(ffmpeg.probe(planet).get("format").get("tags").get("comment"))
        #print(planet)
        #print(meta)
        system = meta.get('star_system')
        greek = meta.get('star_index')
        index = meta.get('planet_index')
        for attempt in ["","_(2)","_(3)","_(4)","_(5)","_(6)","_(7)","_(8)","_(9)"]:
            try:
                link = "planet_%s_%s_%s%s.mp4" % (greek, system, index, attempt)
                os.link(planet, link)
                print("%s -> %s" % (planet, link))
                break # success, we are done
            except Exception as e:
                print("%s linking %s, will attempt again with numbered filename" % (e, planet), file=sys.stderr)


        


    


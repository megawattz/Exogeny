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

def output(file, template):
    try:
        meta = json.loads(ffmpeg.probe(file).get("format").get("tags").get("comment"))
    except Exception as e:
        print("%s has error %s." % (file, e), file=sys.stderr)
        return

    newfile = template.format(*meta, **meta)

    utils.writefile(newfile, json.dumps(meta, indent=4));
    
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(r'extract metadata into a new specs file into a specified directory. specs file is a format that you can put any of the planet metadata into using {} syntax as variable, but most likely {identity} is what you want.')
        print('usage example: respec.py "format=/app/planetor/out/specs/{identity}.json" *.mp4')
        print("metadata fields available: id,planet_size,camera_location,camera_angle,camera_look_at,sun_brightness,sun_position,background,planet,clouds_size,clouds,clouds_density,atmosphere,atmosphere_composition,atmosphere_density,atmosphere_size,moons,moon_position,moon_size,moon,rings,random_color,random_float,random_trans,star_system,star_index,planet_index,evaluation,evaluation2,identity,lifeform,chemistry,planet_type,unexplored,artist,rare,radioactives,refractories,industrials,specialized,biologicals,exotics,relics,resources_value,created")
        sys.exit(0);

    params, args = utils.fetchArgs(sys.argv[1:], docs= {
        "format": "*output metadata in this format (string with embedded variables)",
    })

    for file in args:
        output(file, params['format'])

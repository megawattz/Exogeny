#!/usr/bin/env python3

import os.path
import sys
import json
import ffmpeg
import utils
import re
from pprint import pprint

# Remove planets with duplicate designations, keep newest one

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

def output(file, template):
    try:
        meta = json.loads(ffmpeg.probe(file).get("format").get("tags").get("comment"))
    except Exception as e:
        print("%s has error %s." % (file, e), file=sys.stderr)
        return

    meta['meta'] = json.dumps(meta, indent=4)
    print(template.format(*meta, **meta))

if __name__ == "__main__":
    if len(sys.argv) < 1:
        print('setmeta.py set metadata in mp4 file, setmeta.py filename key=value key=value key=value' )
        print('usage example: setmeta.py planet_video.mp4 star_index=Beta star_system=Urvan planet_index=IX')
        print("metadata fields available:")
        sys.exit(0);

    params, args = utils.fetchArgs(sys.argv[1:], docs= {
    })

    try:
        os.makedirs("out")
    except FileExistsError:
        pass
    
    # first argument is filename
    input_file = args.pop(0)        

    probe = ffmpeg.probe(input_file)
    
    # Extract the existing metadata from the video stream (assuming video stream is the first stream)
    meta = json.loads(probe.get("format").get("tags").get("comment"))

    for arg in args:
        key, value = re.split("=", arg, maxsplit=2)
        meta[key] = value;

    
    output_file = "out/"+os.path.basename(input_file)
    
    ffmpeg.input(input_file).output(output_file, **{'metadata': 'comment=' + json.dumps(meta)}).run()
                                    

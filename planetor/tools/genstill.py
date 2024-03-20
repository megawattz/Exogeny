#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import re
import utils
import time
from pprint import pprint

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

Help = '''
'''
if __name__ == "__main__":
    if len(sys.argv) < 1:
        print("Generate an opensea metadata file");
        print("usage: osmeta.py filespec_wildcard_ok")
        sys.exit(0);

    params, extra = utils.fetchArgs(sys.argv[1:], docs={
        "frame":"which frame offset to export as a still"
    }

    ${NICE} ffmpeg -i planet.mp4 -vf "select=eq(n\,${HALF})" -vframes 1 ${STILLS}/planet_${IDENTITY}.gif
                                    

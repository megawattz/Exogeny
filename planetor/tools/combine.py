#!/usr/bin/env python3

import os.path
import sys
import utils
import os
import re
from pprint import pprint

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

if __name__ == "__main__":
    if (len(sys.argv) < 2):
        sys.stdout.write("Combine random lines from each file into the format string");
        sys.exit(0);
        
    params, files = utils.fetchArgs(sys.argv[1:], docs= {
        "format":"format using the file name as a selector with the choose function, example: f'I like {choose(\"food\")} at {choose(\"restaurant}\")"
    })

    # load strings from files
    sources = {}
    for file in files:
        filename = os.path.splitext(os.path.basename(file))[0]
        sources[filename] = utils.filelines(file)

    def choose(match):
        filename = match.group(1)
        which = sources.get(filename)
        if not which:
            return f"no file {filename}"
        what = utils.randomlist(which)
        return what

    output = re.sub('{(.+?)}', choose, params['format'])
    
    print(output)


        


    


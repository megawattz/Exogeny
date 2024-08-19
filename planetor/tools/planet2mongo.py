#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import re
import utils
import time
import pymongo
from pprint import pprint

print(f"Pymongo Version {pymongo.version} version_info: owned-planets 3d827bf 08/19/24-13:45:28-EDT-0400", file=sys.stderr)

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

def message(*args):
    # This is a placeholder for the actual implementation of the message function
    frame = sys._getframe(1)
    print(f"{os.path.basename(frame.f_code.co_filename)}:{frame.f_lineno}: ", *args, file=sys.stderr)

if __name__ == "__main__":
    params, specs = utils.fetchArgs(sys.argv[1:], docs={
        "server":"mongo URL: default = mongodb://localhost:27017",
        "civ":"directory (only) where civilization files are kept",
        "test":"merge files but do not insert into mongo"
    });

    if len(specs) < 1:
        help = """merge specs and civilization data on a planet into mongodb
        usage: planet2mongo.py server=mongodb://hostname:port civ=/app/planetor/out/civilization/ specfile specfile specfile ...
        example: mongo --server=mongodb://localhost:27017 --civ=civilization/ specs/*.json 
        """
        message(help)
        sys.exit(0);
        
    Mongo = pymongo.MongoClient(params.get("server") or "mongodb://mongo:27017")
    db = Mongo['exogeny']
    collection = db['planets']

    for spec in specs:
        print(spec)
        jsondata = {};
        with open(spec, 'r') as file:
            jsondata = json.load(file);
        with open(f"{params['civ']}/civilization_{jsondata['identity']}.json") as file:
           civdata = json.load(file)
           jsondata.update(civdata)

        if params.get('test'):
            print(json.dumps(jsondata, indent=4), flush=True)
        else:
            result = collection.update_one({'identity':jsondata['identity']}, {'$set': jsondata}, upsert=True);
            for doc in result:
                print(json.dumps(doc, indent=4), flush=True)

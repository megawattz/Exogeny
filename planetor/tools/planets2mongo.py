#!/usr/bin/env python3

import os.path
import sys
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
    params, planets = utils.fetchArgs(sys.argv[1:], docs={
        "server":"mongo URL: default = mongodb://localhost:27017",
        "planets":"planet file (file used by the website for planet data)",
        "test":"show what would be pushed into mongo"
    });

    if len(planets) < 1:
        help = """import planets files (files in the /app/website/configs directory)
        usage: planets2mongo.py server=mongodb://hostname:port planetfile planetfile planetfile ...
        example: mongo --server=mongodb://localhost:27017 /app/website/configs/vesper/planets.json
        """
        message(help)
        sys.exit(0);
        
    Mongo = pymongo.MongoClient(params.get("server") or "mongodb://mongo:27017")
    db = Mongo['exogeny']
    collection = db['planets']

    for datafile in planets:
        try:
            with open(datafile, 'r') as file:
                jsondata = json.load(file);  # data is in a huge json array
                for planet in jsondata:
                    if "test" in params:
                        pprint(planet);
                    else:
                        result = collection.update_one({'identity':planet['identity']}, {'$set': planet});
                        print(result.raw_result, flush=True)
                   
        except Exception as err:
            print(err)

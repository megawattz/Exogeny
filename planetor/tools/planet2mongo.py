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

print(f"Pymongo Version {pymongo.version} version_info: add-planet-to-mongo 4475627 07/25/24-16:40:06-EDT-0400", file=sys.stderr)

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

Notes = '''
Notes:

1) Make a mongo query

2) There are various anomalies in the planets, intentionally. Can you find any?
'''

def message(*args):
    # This is a placeholder for the actual implementation of the message function
    frame = sys._getframe(1)
    print(f"{os.path.basename(frame.f_code.co_filename)}:{frame.f_lineno}: ", *args, file=sys.stderr)

def execmongo(client, command):
    """Execute a MongoDB command using pymongo."""
    # Split the command to identify the database and the collection0
    db_name, collection_name, operation, remainder = re.split(r'[.)(]+', command, maxsplit=3)
    message(f"Command:{command} Database:{db_name} Collection:{collection_name} Operation:{operation} Args:{remainder}")

    args = re.split(r'[)(;]+', remainder)

    if args[-1] is None or args[-1] == "":
        args.pop()

    db = client[db_name]
    collection = db[collection_name]
    
    # Convert arguments from string to appropriate types (if possible)
    #args = [eval(arg) for arg in args]
    # Execute the operation

    args = [eval(arg) for arg in args]

    if operation == "find":
        if len(args) < 2:
            args.append({"_id": 0})
        else:
            args[1]["_id"] = 0 # suppress mongo id
    
    message(f"{operation} {args}")
    
    result = getattr(collection, operation)(*args)

    return result

def replaceWithFile(match):
    filename = match.group(1)
    try:
        with open(filename, 'r') as file:
            return file.read()
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    if len(sys.argv) < 1:
        help = """merge specs and civilization data on a planet into mongodb
        usage: planet2mongo.py server=mongodb://hostname:port civ=/app/planetor/out/civilization/ specfile specfile specfile ...
        example: mongo --server=mongodb://localhost:27017 --civ=civilization/ specs/*.json 
        """
        message(help)
        sys.exit(0);

    params, specs = utils.fetchArgs(sys.argv[1:], docs={
        "server":"mongo URL: default = mongodb://localhost:27017",
        "civ":"directory (only) where civilization files are kept"
    });

    Mongo = pymongo.MongoClient(params.get("server") or "mongodb://mongo:27017")
    db = client['exogeny']
    collection = db['planets']

    for spec in specs:
        jsondata = {};
        with open(spec, 'r') as file:
            jsondata = json.load(file);
        with open(f"{params['civ']/civilization_{jsondata['identity']}.json") as file:
           civdata = json.load(file)
           jsondata.update(civdata)
            
        result = collection.update_one({'identity':jsondata.identity}, {'$set': jsondata}, upsert=True);
        for doc in result:
            print(json.dumps(doc, indent=4))

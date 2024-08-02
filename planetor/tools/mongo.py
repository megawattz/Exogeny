#!/usr/bin/env python3
#!python3

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
    message(f"Command:{command} Database:{db_name} Collection:{collection_name} Operation: {operation} Args:{remainder}")

    args = re.split(r'[)(;]+', remainder)

    if args[-1] is None or args[-1] == "":
        args.pop()

    db = client[db_name]
    collection = db[collection_name]
    
    # Convert arguments from string to appropriate types (if possible)
    #args = [eval(arg) for arg in args]
    # Execute the operation

    args = [eval(arg) for arg in args]

    message(f"{command} {args}")
    
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
        help = """Make a mongo db query
        usage: mongo server=mongodb://hostname:port query query query ...
        where query is of the general format "database.collection.command.arguments...", 
        example: mongo server=mongodb://localhost:27017 exogeny.planets.find({"identity", "78c701a2-4aa4-11ef-8bb3-5bb5dfbe4b64"})
        WARNING: Use ; to separate mongo arguments instead of ,  This simple parser cannot distiguish argument separator , from , inside text
        WARNING: when finding, you need to suppress the mongo _id object, like, database.collection.find({};{'_id': 0})
        @{filename} = read contents from filename into commandline
        """
        message(help)
        sys.exit(0);

    params, queries = utils.fetchArgs(sys.argv[1:], docs={
        "server":"mongo URL: default = mongodb://mongo:27017"
    });

    Mongo = pymongo.MongoClient(params.get("server") or "mongodb://mongo:27017")
    
    for query in queries:
        query = re.sub('@([a-zA-Z0-9./_-]+)', replaceWithFile, query)
        result = execmongo(Mongo, query)

        message(type(result))
        
        if isinstance(result, pymongo.results.InsertOneResult):
            message(f"inserted: {result.inserted_id}")
        elif isinstance(result, pymongo.results.UpdateResult):
            message(f"inserted: {result.upserted_id}")
        elif isinstance(result, dict):
            print(json.dumps(result, indent=4))
        else:
            for doc in result:
                print(json.dumps(doc, indent=4))

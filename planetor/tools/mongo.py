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

print(f"Pymongo Version {pymongo.version}", file=sys.stderr)

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

Notes = '''
Notes:

1) Make a mongo query

2) There are various anomalies in the planets, intentionally. Can you find any?
'''

def execmongo(client, command):
    """Execute a MongoDB command using pymongo."""
    # Split the command to identify the database and the collection0
    db_name, collection_name, operation, remainder = re.split(r'[.)(]+', command, maxsplit=3)
    print(f"Command:{command} Database:{db_name} Collection:{collection_name} Operation: {operation} Args:{remainder}", file=sys.stderr)

    args = re.split(r'[,)(]', remainder)
    
    if args[-1] is None or args[-1] == "":
        args.pop()

    db = client[db_name]
    collection = db[collection_name]

    # Convert arguments from string to appropriate types (if possible)
    args = [eval(arg) for arg in args]
    # Execute the operation
    result = getattr(collection, operation)(*args)

    return result

if __name__ == "__main__":
    if len(sys.argv) < 1:
        help = """Make a mongo db query
        usage: mongo server=mongodb://hostname:port query query query ...
        where query is of the general format "database.collection.command.arguments...", 
        example: mongo server=mongodb://localhost:27017 exogeny.planets.find({"identity", "78c701a2-4aa4-11ef-8bb3-5bb5dfbe4b64"})
        """
        print(help)
        sys.exit(0);

    params, queries = utils.fetchArgs(sys.argv[1:], docs={
        "server":"mongo URL: default = mongodb://mongo:27017"
    });

    Mongo = pymongo.MongoClient(params.get("server") or "mongodb://mongo:27017")
    
    for query in queries:
        result = execmongo(Mongo, query)
        # Pretty print the result
        if isinstance(result, dict):
            pprint(result)
        else:
            for doc in result:
                pprint(doc)

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

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

Notes = '''
Notes:

1) Make a mongo query

2) There are various anomalies in the planets, intentionally. Can you find any?
'''

if __name__ == "__main__":
    if len(sys.argv) < 1:
        print("Make a mongo db query");
        print("usage: osmeta.py filespec_wildcard_ok")
        sys.exit(0);

    params, queries = utils.fetchArgs(sys.argv[1:], docs={
        "server":"mongo URL: default = mongodb://localhost:27017",
        "database":"database, default exogeny",
        "collection":"which collection, planets, civilizations, players, etc.",
        "query":"mongo style query in JSON syntax"})

    Server = params.get("server") or "mongodb://localhost:27017"
    Database = params.get("database") or "exogeny"
    Collection = params.get("collection")

    Mongo = pymongo.MongoClient(server)
    database = Mongo[Database]

    collection = Database[collection]
    data = collection.find_one(query)
    
    if len(queries) < 1:
        queries.append(sys.stdin.read())

    for query in queries:
        pprint(collection.command(query))
        

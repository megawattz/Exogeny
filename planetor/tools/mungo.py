#!/usr/bin/env python3

import pprint
import pymongo

MONGO_HOST = "137.184.69.83"

MONGO_PORT = 56728

CONNECT = f'mongodb://walterhoward%40gmail.com:Ldibalclw1N@{MONGO_HOST}:{MONGO_PORT}/?authMechanism=DEFAULT&tls=true&authSource=admin'

print("connecting to: "+CONNECT)

con = pymongo.MongoClient(CONNECT)

user_table = con['parse']['_User']

pprint.pprint(user_table.find_one())

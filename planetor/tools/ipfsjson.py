#!/usr/bin/env python3

import os.path
import sys
import re
import ffmpeg
import json
import requests
import base64
import utils
from pprint import pprint

API_KEY = "INNMibkxLXWuHzXOmylj5375ovAJx8ygByGjr0EkYGDxKl28FbmbrN7haO6sqkG5"
MORALIS_BASE = "https://deep-index.moralis.io/api/v2/ipfs/uploadFolder"
PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

LOGFILE="ipfsjson.json"  # json without enclosing [] so it can be appended to

import planetor

def readfile(path):
    f = open(path, "rb")
    data = f.read()
    f.close()
    return data

def ipfsupload(data):
    response = None
    if True: #try:
        headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json", "accept": "application/json"}
        print("Upload to %s" % MORALIS_BASE)
        response = requests.request(url="%s" % MORALIS_BASE, method="POST", headers=headers, data=json.dumps(data) )
        pyresponse = json.loads(response.content)
        #print(response.status_code, response.reason)
        return pyresponse
    #except Exception as e:
     #   print(e)
      #  print("%s %s\n%s\n%s" % (response.status_code, response.reason, response.content))

IPFStoPush = []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("upload json metadata files for opensea")
        print("usage example: ipfsjson.py *.json")
        sys.exit(0);

    params, files = utils.fetchArgs(sys.argv[1:], docs={
        "limit":"only do this many files",
        "test":"do not push to ipfs, just show what would be pushed",
        "logfile":"where to log upload URLS"
    })
    if params.get("logfile"):
        LOGFILE=params.get("logfile")

    erc1155url = None;
    count = 0
    for metadata in files:
        rawcontent = str(readfile(metadata), 'utf-8')

        try:
            metadatacontent = json.loads(rawcontent)
        except Exception as e:
            print("%s\n%s" % (e, rawcontent), file=sys.stderr)
            sys.exit(-1)

        IPFStoPush.append({"path": metadata, "content": metadatacontent})

        count = count + 1
        if "limit" in params and count >= int(params['limit']):
            break

    if not "test" in params:
        uplog = open(LOGFILE, "a")
        if not uplog:
            raise Exception("Failed to open %s" % LOGFILE)
        print("starting upload to ipfs")
        uploads = ipfsupload(IPFStoPush)
        #print(uploads)
        for file in uploads:
            if not erc1155url:
                erc1155url = re.sub(r"0000000000.+", r"{id}.json", file['path'])
            uplog.write(json.dumps(file['path'], indent=4))
            uplog.write(",\n")
    else:
        print("test run, not actually pushed to IPFS")
        
    print("%s files" % count)
    print("ERC1155 URL Pattern:\n%s" % erc1155url)

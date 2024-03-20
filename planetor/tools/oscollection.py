#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import re
import utils
import requests
import base64
import urllib.parse
import time
from pprint import pprint

API_KEY = "INNMibkxLXWuHzXOmylj5375ovAJx8ygByGjr0EkYGDxKl28FbmbrN7haO6sqkG5"
MORALIS_BASE = "https://deep-index.moralis.io/api/v2/ipfs/uploadFolder"
PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

def contractMetadata(collectionName, bannerImageURL, fee_recipient, fee_percentage, description):
    return '''{
    "name": "%s",
    "description":"%s",
    "image": "%s",
    "external_link": "https://exoplaneteer.com/collections/%s",
    "fee_recipient": "%s",
    "seller_fee_basis_points": %s
}
''' % (collectionName, description, bannerImageURL, urllib.parse.quote(collectionName), fee_recipient, fee_percentage)

def readfile(path):
    f = open(path, "rb")
    data = f.read()
    f.close()
    return data

def ipfsupload(data):
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json", "accept": "application/json"}
    response = requests.request(url="%s" % MORALIS_BASE, method="POST", headers=headers, data=json.dumps(data))
    pyresponse = json.loads(response.content)
    print(response.status_code, response.reason)
    print(pyresponse)
    return pyresponse

def updateLog(logfile, pushes):
    uplog = open(logfile, "a")
    for file in pushes:
        print("Writing %s to log %s" % (file['path'], logfile))
        uplog.write(json.dumps(file['path'], indent=0))
        uplog.write(",\n")
    uplog.close()
    return pushes

LOGFILE="/app/planetor/permalogs/ipfsplanet.json"  # json without enclosing [] so it can be appended to

IPFStoPush = []

if __name__ == "__main__":
    if len(sys.argv) < 1:
        print("Upload OpsenSea contract/collection metadata"); # see https://docs.opensea.io/docs/contract-level-metadata
        print("usage: oscollection.py name=<name of collection> banner=<image file for use in collection banner>")
        sys.exit(0);
        
    params, extra = utils.fetchArgs(sys.argv[1:], docs={
        "logfile":"place to put IPFS urls for generated output",
        "description":"*describe what the collection is",
        "name":"*name of collection",
        "banner":"*image to be used as banner",
        "fee_recipient":"wallet address of who receives fees",
        "fee_percentage":"percent fee in basis points (100 per 1%)",
        "test":"set this to anything to do everything except actually push the content"
    })

    logfile = params.get("logfile") or "oscontract.json"
        
    directory,filename = os.path.split(params['banner'])
    imagecontent = str(base64.b64encode(readfile(params['banner'])), 'utf-8')

    IPFStoPush.append({"path": filename, "content": imagecontent})
    uploads = ipfsupload(IPFStoPush)
    
    parts = utils.ipfsparse(uploads[0]['path']) # capture URL that was uploaded
    metacontent = contractMetadata(params['name'], uploads[0]['path'], params['fee_recipient'], params['fee_percentage'], params["description"])

    print(metacontent)
    
    uploads.append(IPFStoPush.append({
        "path":"contract.json",
        "content": str(base64.b64encode(bytes(metacontent, 'utf-8')), 'utf-8')
    }))

    if not "test" in params:
        metaupload = ipfsupload(IPFStoPush)
        updateLog(logfile, metaupload)
        print(metaupload)
    else:
        print("test run, not actually pushed to IPFS")

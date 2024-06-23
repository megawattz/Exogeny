#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import requests
import base64
import utils
import re
from pprint import pprint

'''
 Note: The NFTs mp4 and still has to be uploaded to IPFS first, with the file names being sequential numbers from
"top of fungibles" to the number of NFTs. Images too must be uploaded similarly and since the sequenial numbers
must match, this must be done in the same push to IPFS to guarantee the still image applies to the mp4.
'''

# howto extract image from mp4
# ffmpeg -i ../gallery/planet_111308.mp4  -r 1 image.jpg

'''
procedure

1. link mp4s into directory with sequential, ERC1155 numbers (64 hex digits), not the original file names
2. link the pngs into the same directory but no need to do the hex digit stuff (the gifs won't be put into the smart contract)
3. generate opensea metadata for the mp4s into the same directory but no need for ERC1155 naming convention
3. upload the entire directory to IPFS, mp4s, stills and metadata jsons
4. 
'''

API_KEY = "INNMibkxLXWuHzXOmylj5375ovAJx8ygByGjr0EkYGDxKl28FbmbrN7haO6sqkG5"
MORALIS_BASE = "https://deep-index.moralis.io/api/v2/ipfs/uploadFolder"
PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

LOGFILE="ipfsplanets.json"  # json without enclosing [] so it can be appended to

import planetor

def readfile(path):
    f = open(path, "rb")
    data = f.read()
    f.close()
    return data

def ipfsupload(data):
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json", "accept": "application/json"}
    response = requests.request(url="%s" % MORALIS_BASE, method="POST", headers=headers, data=json.dumps(data) )
    pprint(response)
    pyresponse = json.loads(response.content)
    print(response.status_code, response.reason)
    return pyresponse

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("prep and upload planet NFT files to ipfs (also generates and uploads a still image for use in opensea)")
        print('''
1) generate image from video,
2) upload image and video to ipfs,
3) log what was uploaded into %s so later utilities know how to reference those files
''' % LOGFILE); 
        print("usage example: ipfsplanet.py banner=file.png videos*.mp4")
        sys.exit(0);

    image_type = "png"
    
    params, files = utils.fetchArgs(sys.argv[1:], docs={
        "banner":"*banner image to use for collection on OpenSea",
        "limit":"only do this many files per upload (multiple uploads will be done)",
        "test":"do not push to ipfs, just verify metadata extraction",
        "skip":"skip X number of files (use this if an upload failed and you want to restart after the point of failure)",
        "logfile":"where to log upload URLS",
        "lifeform": r"*filemask to where the associated lifeform/landscape file is (put %s where the planet id should go, default is /app/planetor/out/lifeforms/lifeform_%s.png"
    })

    if params.get("logfile"):
        LOGFILE=params.get("logfile")
        
    lifeform = params.get('lifeform') or "/app/planetor/out/lifeforms/lifeform_%s.png"
    bannerfile = params.get('banner') or 'banner.gif'
    limit = int(params.get('limit') or "8")
    skip = int(params.get('skip') or "0")

    pprint(params)
    
    imagecontent = str(base64.b64encode(readfile(bannerfile)), 'utf-8')

    count = 0
    batchcount = 0

    for batch in range(0, len(files), limit):
        batchcount = 0
        IPFStoPush = []
        for video in files[batch:batch+limit]:
            if (count < skip):
                continue
            vdir, vfile = re.findall('(.*?)([^/]+$)', video)[0]
            #print("video dir:%s base:%s" % (vdir, vfile))
            planetid = re.findall(r'([a-fA-F0-9-]{36})', video)[0]
            print("planetid: %s" % planetid)
            image = lifeform % planetid
            idir, ifile = re.findall('(.*?)([^/]+$)', image)[0]

            try :
                videocontent = str(base64.b64encode(readfile(video)), 'utf-8')
                imagecontent = str(base64.b64encode(readfile(image)), 'utf-8')
            except Exception as e:
                pprint(e, stream=sys.stderr)
                pprint(video, stream=sys.stderr)
                continue

            print("\t"+vfile)
            print("\t"+ifile)
        
            IPFStoPush.append({"path": vfile, "content":videocontent})
            IPFStoPush.append({"path": ifile, "content":imagecontent})

            count += 1
            batchcount += 1
    
        if not "test" in params:
            #if (batchcount < limit): # are we on the last batch?
                #IPFStoPush.append({"path": "collection_banner", "content": imagecontent})
            print("Upload batch of %s starting at %s of %s total" % (batchcount, batch, len(files)))
            uplog = open(LOGFILE, "a")
            uploads = None;
            try:
                uploads = ipfsupload(IPFStoPush)
            except Exception as e:
                print(f"Skipping. Exception occurred: {e}");
                continue
            
            for file in uploads:
                uplog.write(json.dumps(file['path'], indent=4))
                uplog.write(",\n")
                print(file)
        else:
            print("test run, not actually pushed to IPFS")
    print("uploaded %s files" % count)


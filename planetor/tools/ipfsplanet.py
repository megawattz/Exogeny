#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import requests
import base64
import utils
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
        print("usage example: ipfsplanet.py *.mp4")
        sys.exit(0);

    image_type = "png"
    
    params, files = utils.fetchArgs(sys.argv[1:], docs={
        "limit":"only do this many files per upload (multiple uploads will be done)",
        "test":"do not push to ipfs, just verify metadata extraction",
        "skip":"skip X number of files (use this if an upload failed and you want to restart after the point of failure)",
        "logfile":"where to log upload URLS",
        "banner":"*banner image to use for collection on OpenSea",
        "img":"image type extension"
    })

    image_type = params.get('img') or image_type
    
    if params.get("logfile"):
        LOGFILE=params.get("logfile")
        
    count = 0
    bannerfile = params.get('banner') or 'banner.gif'
    limit = int(params.get('limit') or "10")
    skip = int(params.get('skip') or "0")
    imagecontent = str(base64.b64encode(readfile(bannerfile)), 'utf-8')
    count = 0
    batchcount = 0

    for batch in range(0, len(files), limit):
        batchcount = 0
        IPFStoPush = []
        for video in files[batch:batch+limit]:
            if (count < skip):
                continue
            base, ext = os.path.splitext(video)
            print("base:%s ext:%s" % (base, ext))
            image = base+"."+image_type
            if not os.path.exists(image):
                try:
                    ffmpeg.input(video, ss=1).filter('scale', w=348, h=262).output(image, vframes=1).run(overwrite_output=True)
                except Exception as e:
                    print("Failed to create still image for %s, %s, skipping file." % (video, e), file=sys.stderr)
                    continue;
            videocontent = str(base64.b64encode(readfile(video)), 'utf-8')
            imagecontent = str(base64.b64encode(readfile(image)), 'utf-8')

            print(video)
            print(image)
        
            IPFStoPush.append({"path": video, "content":videocontent})
            IPFStoPush.append({"path": image, "content":imagecontent})

            count += 1
            batchcount += 1
    
        if not "test" in params:
            #if (batchcount < limit): # are we on the last batch?
                #IPFStoPush.append({"path": "collection_banner", "content": imagecontent})
            print("Upload batch of %s starting at %s of %s total" % (batchcount, batch, len(files)))
            uplog = open(LOGFILE, "a")
            uploads = ipfsupload(IPFStoPush)
            for file in uploads:
                uplog.write(json.dumps(file['path'], indent=4))
                uplog.write(",\n")
                print(file)
        else:
            print("test run, not actually pushed to IPFS")
    
    print("uploaded %s files" % count)

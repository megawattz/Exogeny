#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import requests
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

IPFS_BASE=MORALIS_BASE = "https://deep-index.moralis.io/api/v2/ipfs"
API_KEY = "INNMibkxLXWuHzXOmylj5375ovAJx8ygByGjr0EkYGDxKl28FbmbrN7haO6sqkG5"
PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

def osattrib(name, value):
    return {"trait_type":name, "value":value}

def osmetadata(filename):
    osmeta = {
    }
    attributes = []
    meta = json.loads(ffmpeg.probe(mp4).get("format").get("tags").get("comment"))
    for key in ["id","moons","mp4_type","atmosphere_composition"]:
        attributes.append(osattrib(key, meta.get(key)))
        attributes.append(osattrib("official_designation", "%s %s %s" % (meta["star_index"], meta["star_system"], meta["mp4_index"])))
        attributes.append(osattrib("indigenous_lifeform", meta.get("lifeform")))
        attributes.append(osattrib("atmosphere", meta.get("atmosphere_composition")))
        attributes.append(osattrib("natural_resource_value", meta.get("resources_value")))
        
        osmeta["attributes"] = attributes
        # others [,"rare","radioactives":"refractories":"industrials":"specialized":"0.05","biologicals":"10.99","exotics":"1.03","relics":"0.22"
        
    pprint(osmeta)
    return osmeta

def osattrib(name, value):
    return {"trait_type":name, "value":value}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("extract metadata from planet and generate an opensea metadata file");
        print("usage: osmeta.py destination_dir ipfsdir filespec_wildcard_ok")
        sys.exit(0);
    ipfsdir = sys.argv[1]
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json", "accept": "application/json"}
    response = requests.request(url=ipfsdir, method="GET", headers=headers)
    pyresponse = json.loads(response.content)
     
    for file in pyresponse['Objects']:
        print(file)
        #except Exception as e:
            #print("%s %s" % (e, planet))
        #identity = planetor.extract_id(planet)
        #civ = planetor.civilization(identity, {})

        


    


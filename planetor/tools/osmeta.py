#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import re
import utils
import time
from pprint import pprint

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

Notes = '''
Notes:

1) Unexplored planets, intentionally, do not have icons or labels in the video, making them better for displaying in
photo frames and screen savers. They still have all the game qualities that explored planets have.

2) There are various anomalies in the planets, intentionally. Can you find any?
'''

def RtoA(roman):
    return {
        "prime":1,
        "prime":1,
        "ii":2,
        "iii":3,
        "iv":4,
        "v":5,
        "vi":6,
        "vii":7,
        "viii":8,
        "ix":9,
        "x":10,
        "xi":11,
        "xii":12,
        "xiii":13,
        "xiv":14,
        "xv":15
    }[roman.lower()] or 0


def osattrib(name, value, valtype = None):
    trait = {"trait_type":name, "value":value}
    if valtype:
         trait["display_type"] = valtype
    return trait

if __name__ == "__main__":
    if len(sys.argv) < 1:
        print("Generate an opensea metadata file");
        print("usage: osmeta.py filespec_wildcard_ok")
        sys.exit(0);

    ipfsplanets = "ipfsplanets.json"
    image_type = "png"
    params, extra = utils.fetchArgs(sys.argv[1:], docs={
        "ipfsplanets":"file with quoted, comma delimited IPFS urls",
        "contractid":"*contract id of the ERC1155 contract that will manage these tokens",
        "chain":"*which blockchain is that contract on",
        "img":"image type, jpg png or gif"})

    image_type = params.get("img") or image_type
    ipfsplanets = params.get("ipfsplanets") or ipfsplanets
    temp = str(utils.readfile(ipfsplanets), 'utf-8')

    ipfsurls = json.loads("[%s]" % temp[:-2])  # ipfsuploads are json compatible but missing enclosing array delimters (-2 = remove trailing , and newline)

    names = {}
    nftindex = 0
    duplicates = 0
    
    for ipfsurl in ipfsurls:
        videofile = None
        if True:
        #try:
            #print(ipfsurl)
            # sample https://ipfs.moralis.io:2053/ipfs/QmfVrGHe9KktwYMRdgZQYrZQLUkSS3sj51RjKhgwsHDcTw/planet_1324121.jpg
            elements = re.findall("(.*?ipfs/)([^/]+)/([^.]+).mp4", ipfsurl)
            if not elements:
                continue
            #print("elements %s" % elements)
            url,hash,filename = elements[0]
            #print("url:%s hash:%s filename:%s" % (url, hash, filename))
            
            attributes = []
            
            # extract metadata stored right in the mp4 file under "comment"
            videofile = "%s.mp4" % filename
            #print(videofile)
            info = ffmpeg.probe(videofile).get("format").get("tags")
            
            meta = json.loads(info.get("comment"))
            relative_planet_index = RtoA(meta.get('planet_index'))
            for key in ["planet_type","star_system"]:
                attributes.append(osattrib(key, meta.get(key)))

            evaluation = meta.get("evaluation") or "None";    
            evaluation2 = meta.get("evaluation2") or "None";    
            attributes.append(osattrib("evaluation", evaluation))
            attributes.append(osattrib("evaluation2", evaluation2))
            attributes.append(osattrib("galactic_catalog", meta.get("id")))
            attributes.append(osattrib("atmosphere", meta.get("atmosphere_composition")))
            attributes.append(osattrib("parent_star", "%s_%s" % (meta["star_index"], meta["star_system"])))
            attributes.append(osattrib("indigenous_lifeform", meta.get("lifeform")))
            attributes.append(osattrib("unexplored", meta.get("unexplored")))

            attributes.append(osattrib("natural_resources_rating", float(meta.get("resources_value")), "number"))
            attributes.append(osattrib("rare_minerals", float(meta.get("rare")), "number"))
            attributes.append(osattrib("radioactives", float(meta.get("radioactives")), "number"))
            attributes.append(osattrib("high_temperature_minerals", float(meta.get("refractories")), "number"))
            attributes.append(osattrib("industrial_minerals", float(meta.get("industrials")), "number"))
            attributes.append(osattrib("specialized_minerals", float(meta.get("specialized")), "number"))
            attributes.append(osattrib("biological_resources", float(meta.get("biologicals")), "number"))
            attributes.append(osattrib("exotic_resources", float(meta.get("exotics")), "number"))
            attributes.append(osattrib("relics", float(meta.get("relics")), "number"))

            attributes.append(osattrib("orbital_position", relative_planet_index, "number"))
            attributes.append(osattrib("moons", int(meta.get("moons")), "number"))
            
            attributes.append(osattrib("created", int(time.time()), "date"))
            attributes.append(osattrib("artist", info.get("artist") or "anonoymous"))

            designation = "%s %s %s" % (meta["star_index"], meta["star_system"], meta["planet_index"])
            osmeta = {
                "name": designation,
                "image": "https://ipfs.moralis.io:2053/ipfs/%s/%s.%s" % (hash, filename, image_type),
                "animation_url":"https://ipfs.moralis.io:2053/ipfs/%s/%s.mp4" % (hash, filename),
                "external_url":"https://exoplaneteer.com/m/planetdetail.html?identity=%s&designation=%s&chain=%s&contract=%s&tokenid=%s&user=observer"
                        % (meta.get('id'), designation, params['chain'], params['contractid'], nftindex)
            }

            description = \
'''%s is a planet of %s type in the %s star cluster, with the relative orbital position %s from its star %s %s. Its atmosphere is composed primarily of %s and the dominant, indigenous life form is %s. It has a natural resource value of %s out of a possible maximum of 800''' %  (osmeta.get('name'),
                                                                        meta.get("planet_type"), meta.get('star_system'), relative_planet_index,
                                                                        meta.get("star_index"), meta.get("star_system"), meta.get("atmosphere_composition"),
                                                                        meta.get("lifeform"), meta.get("resources_value"))

            osmeta['description'] = re.sub("_", " ", description+Notes)
            osmeta["attributes"] = attributes
            # others [,"rare","radioactives":"refractories":"industrials":"specialized":"0.05","biologicals":"10.99","exotics":"1.03","relics":"0.22"

            jsonmeta = json.dumps(osmeta, indent=4)
            name = osmeta['name']
            if name in names:
                print("%s is duplicate: %s" % (filename, name), file=sys.stderr)
                duplicates += 1
                continue
            print("%s\n   %s\n   %s\n   %s" % (meta.get('id'), osmeta['name'], osmeta['animation_url'], osmeta['image']))
            filename = f"{nftindex:064x}.json"
            utils.writefile(filename, jsonmeta)
            nftindex += 1
        #except Exception as e:
            #print("%s doing planet %s" % (e, videofile), file=sys.stderr)
            
print("%s nfts metafiles generated" % nftindex)

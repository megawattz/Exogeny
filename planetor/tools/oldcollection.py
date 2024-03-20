#!/usr/bin/env python3

import os.path
import sys
import ffmpeg
import json
import re
import utils
from pprint import pprint

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

def contractMetadata(starsystem, collectionBannerImage)
return '''
{
    "name":"%s Collection",
    "description":"Fictional exoplanets of Star System %s for the ExoPlanet simulation game, KaonPlanet",
    "image": "%s",
    "external_link": "https://kaonplanet.com/collections/%s",
    "seller_fee_basis_points": 0,
}
''' % (starsystem, starsystem, collectionBannerImage, starsystem)
if __name__ == "__main__":
    if len(sys.argv) < 1:
        print("Upload OpsenSea contract/collection metadata"); # see https://docs.opensea.io/docs/contract-level-metadata
        print("usage: oscollection.py name=<name of collection> banner=<image file for use in collection banner>"
        sys.exit(0);
        
    params, extra = utils.fetchArgs(sys.argv[1:], docs={"ipfsuploads":"file of NFT ipfsurls for this collection", "name":"name of collection","banner":"image to be used as banner})

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
            meta = json.loads(ffmpeg.probe(videofile).get("format").get("tags").get("comment"))
            relative_planet_index = meta.get('planet_index')
            if relative_planet_index == 'Prime':
                 relative_planet_index = "I"
                
            for key in ["moons","planet_type","star_index","star_system","planet_index"]:
                attributes.append(osattrib(key, meta.get(key)))
            attributes.append(osattrib("galactic_catalog_id", meta.get("id")))
            attributes.append(osattrib("atmosphere", meta.get("atmosphere_composition")))
            attributes.append(osattrib("parent_star", "%s %s" % (meta["star_index"], meta["star_system"])))
            attributes.append(osattrib("official_designation", "%s %s %s" % (meta["star_index"], meta["star_system"], meta["planet_index"])))
            attributes.append(osattrib("indigenous_lifeform", meta.get("lifeform")))
            attributes.append(osattrib("natural_resources", meta.get("resources_value")))
            
            osmeta = {
                "name":"%s %s %s" % (meta["star_index"], meta["star_system"], meta["planet_index"]),
                "image": "ipfs://%s/%s.%s" % (hash, filename, params['img']),
                "animation_url":"ipfs://%s/%s.mp4" % (hash, filename),
                "external_url":"https://kaonplanet.com/planet?id=%s&designation=%s" % (meta.get('id'), filename)
            }
            

            description = \
'''%s is a planet of %s type in the %s star cluster, with the relative orbital position %s from its star %s %s. Its atmosphere is composed primarily of %s and the dominant, indigenous life form is %s. It has a natural resource value of %s out of a possible maximum of 800''' %  (osmeta.get('name'),
                                                                        meta.get("planet_type"), meta.get('star_system'), relative_planet_index,
                                                                        meta.get("star_index"), meta.get("star_system"), meta.get("atmosphere_composition"),
                                                                        meta.get("lifeform"), meta.get("resources_value"))

            osmeta['description'] = re.sub("_", " ", description)
            osmeta["attributes"] = attributes
            # others [,"rare","radioactives":"refractories":"industrials":"specialized":"0.05","biologicals":"10.99","exotics":"1.03","relics":"0.22"

            jsonmeta = json.dumps(osmeta, indent=4)
            name = osmeta['name']
            if name in names:
                print("%s is duplicate: %s" % (filename, name), file=sys.stderr)
                continue
            print("%s\n   %s\n   %s\n   %s" % (meta.get('id'), osmeta['name'], osmeta['animation_url'], osmeta['image']))
            filename = f"{nftindex:064x}.json"
            utils.writefile(filename, jsonmeta)
            nftindex += 1
        #except Exception as e:
            #print("%s doing planet %s" % (e, videofile), file=sys.stderr)

            collectionName = params.get("collection") or osmeta['star_system']
            
            filename = "contractMetadata.json"
            utils.writefile(filename, contractMetadta(collectionName, )
            
            
print("%s nfts metafiles generated" % nftindex)

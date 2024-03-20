#!/usr/bin/env python3

import os.path
import sys
import json
import ffmpeg
import utils
import re
import traceback
from pprint import pprint

# Remove planets with duplicate designations, keep newest one

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

Help = '''
ostometa.py put OpenSea metadata into planet mp4 metadata
usage example: ostometa.py informat=planet_{galactic_catalog}.mp4 outformat=planet_{galactic_catalog}_v2.mp4 *.json
where *.json is the wildcard for opensea metadata files 0000000000*.json for example:
'''
OpenSeaUrlFormat = 'https://testnets.opensea.io/assets/{chain_name}/{contract}/{tokenid}'
        
def change_meta():
    params, args = utils.fetchArgs(sys.argv[1:], docs= {
        "informat":'format of input video file name, default "/app/planetor/out/gallery/planet_{galactic_catalog}.mp4"',
        "outformat":'format of output video file name, default "/app/planetor/out/gallery/planet_{galactic_catalog}.mp4"'
    })

    informat = params.get('informat') or "/app/planetor/out/gallery/planet_{galactic_catalog}.mp4"
    outformat = params.get('outformat') or "/app/planetor/out/gallery/new_planet_{galactic_catalog}.mp4"
    
    for file in args:
        os_json = utils.readfile(file)
        os_meta = json.loads(os_json)

        # put attributes in a more convenient place (key values) for random access
        for attribute in os_meta['attributes']:
            os_meta[attribute['trait_type']] = attribute['value']
        # get the video file this metadata applies to
        infile = informat.format(*os_meta, **os_meta)

        # get its metadata
        video_meta = None;
        try:
            video_meta = json.loads(ffmpeg.probe(infile).get("format").get("tags").get("comment"))
        except Exception as e:
            print("skipping file: %s" % infile)
            print(e)
            continue

        video_meta["remote_lifeform"] = os_meta["image"]
        video_meta["animation_url"] = os_meta["animation_url"]
        
        query_dict = {k: v for k, v in re.findall(r'([^&=?]+)=([^&=?]+)', os_meta["external_url"].split('?')[-1] )}
        
        video_meta['chain'] = utils.chainName(query_dict["chain"])
        video_meta['contract'] = query_dict["contract"]
        video_meta['tokenid'] = query_dict["tokenid"]
        
        #video_meta["opensea_url"] = OpenSeaUrlFormat.format(*query_dict, **query_dict)
        
        star_index, star_system, planet_index = re.split(r'\s+', os_meta["name"])
        video_meta["star_system"] = star_system
        video_meta["star_index"] = star_index
        video_meta["planet_index"] = planet_index

        pprint(video_meta)
    
        outfile = outformat.format(*os_meta, **os_meta)
        
        ffmpeg.input(infile).output(outfile, **{'metadata': 'comment=' + json.dumps(video_meta)}).run()
                                    
if __name__ == "__main__":
    if len(sys.argv) < 1:
        print(Help)
        sys.exit(0)

    change_meta()
    '''
    try:
        change_meta()
    except Exception as e:
        print(e, file=sys.stderr)
        traceback.print_exc()
        print(Help)
    '''
    

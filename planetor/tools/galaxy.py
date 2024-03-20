#!/usr/bin/env python3

import os.path
import sys
import json
import ffmpeg
import utils
from pprint import pprint
from operator import itemgetter
import glob
import re

# Remove planets with duplicate designations, keep newest one

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

import planetor

Help = '''
using the star system name and index, generate random but consistent galactic coordinates
the system can be -500 to +500 light years for each x, y an z coordinate
the index can be 0.1 2 light years from the system center
planetary locations are determined differently and are so close to the star in galactic distances that their distance is irrelevant 
(light minutes or hours as opposed to years)

Also, add cultural and misc data that is not in the mp4 embedded metadata that make the planet sound more interesting
and add deployment data such as the IPFS URL of the media files for displaying the planets

All this data compiled into a JSON file for use by the galactic atlas on the website

usage example: galaxy.py method=f meta=id,planet_type,atmosphere,lifeform,resources_value" *.mp4
'''

def lochash(range, string):
    h = str(abs(hash(string)))
    x = int(h[:3]) - range/2
    y = int(h[4:7]) - range/2
    z = int(h[8:11]) - range/2

    return {'x':x, 'y':y, 'z':z}

def getnode(root, node_name):
    node_data = root.get(node_name)
    if not node_data:
        root[node_name] = {}
    return root.get(node_name)

def nested(files, selected, ipfsdata):
    galaxy = {}

    for file in files:
        meta = None
        try:
            print("file %s" % file, file=sys.stderr)
            meta = json.loads(ffmpeg.probe(file).get("format").get("tags").get("comment"))
        except Exception as e:
            print("error: %s %s." % (file, e), file=sys.stderr)
            continue

        system = getnode(galaxy, meta['star_system'])
        star = getnode(system, meta['star_index'])
        planet_index = meta['planet_index']

        planet = {
            "official_designation":"%s %s %s" % (meta["star_index"], meta["star_system"], meta['planet_index']),
            "location": lochash(1000, meta["star_system"])
        }

        for k in selected:
            planet[k] = meta.get(k) or civ[k] or "unknown"
            if k in ipfsdata:
                planet[k] = ipfsdata.get(k)
        
        star[planet_index] = planet

    return galaxy

def flat(files, selected, civfile_template, ipfsdata):
    galaxy = []
    for file in files:
        meta = None
        civ = {};

        try:
            print("Working mp4 file %s" % file, file=sys.stderr)
            meta = json.loads(ffmpeg.probe(file).get("format").get("tags").get("comment"))
        except Exception as e:
            print("%s has error %s." % (file, e), file=sys.stderr)
            continue

        # get the particular planet IPFS data
        ipfs = ipfsdata.get(meta.get('identity'))
        
        if civfile_template:
            try:
                civfile = civfile_template.format(*meta, **meta)
                civ = json.loads(utils.readfile(civfile))
                #print("civilization file %s:\n%s" % (civfile, civ), file=sys.stderr)
            except Exception as e:
                print("%s has error %s, not stopping." % (file, e), file=sys.stderr)
                civ = {}

        try:
            planet = {
                "official_designation":"%s %s %s" % (meta["star_index"], meta["star_system"], meta['planet_index']),
                "location": lochash(1000, meta["star_system"]),
                "star_system": meta['star_system'],
                "star_index": meta['star_index'],
                "planet_index": meta.get('planet_index') or "Rogue",
                "atmosphere": meta.get('atmosphere') or "unknown",
                "lifeform":meta.get('lifeform') or "unknown",
                "lifeform_image": meta.get('remote_lifeform') or ipfs.get('image') or "images/not_available.png",
                "planet_video": meta.get('animation_url') or ipfs.get('animation_url') or "images/not_avaiable.mp4",
            }
        except Exception as e:
            print("%s has error %s, not stopping." % (file, e), file=sys.stderr)
            continue;

        for k in selected:
            temp = ipfs.get(k)
            planet[k] = meta.get(k) or civ.get(k) or "unknown"
            if k in ipfs:
                planet[k] = ipfs.get(k)

        galaxy.append(planet)

    return galaxy

def loadIpfsFiles(glob_pattern):
    aggregated_data = {}
    
    # Use glob to find files matching the pattern
    for filename in glob.glob(glob_pattern):
        with open(filename, 'r') as file:
            data = json.load(file)
            # Assuming 'identity' is a top-level key in your JSON structure
            identity = data.get('identity')
            if identity:
                aggregated_data[identity] = data
    
    return aggregated_data


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(Help)
        sys.exit(0)

    params, files = utils.fetchArgs(sys.argv[1:], docs= {
        "meta":"metadata elements to extract, comma separated",
        "culture":"format of filename containing cultural information of planet {identity}, default /app/planetor/out/civilization/civilization_{identity}.json",
        "ipfs":"format of filenames containing IPFS urls, default ./0000000000000000000000000000000*.json (must have an 'identity' element in the json)",
        "method":"f=flat, n = nested formatted=format_string_with_embedded_variables, i.e. \"planet {planet} has an atmosphere of {atmosphere_composition}\""
    })

    meta = params.get('meta') or "identity,planet_type,atmosphere_composition,evaluation,evaluation2,lifeform,chemistry,resources_value,industrials,refractories,radioactives,rare,specialized,exotics,relics,biologicals,name,species,culture,contract,chain,tokenid"
    civfile_template = params.get('culture') or "/app/planetor/out/civilization/civilization_{identity}.json"
    selected = meta.split(',')
    ipfs = params.get("ipfs") or "00000000000000000000*.json"
    method = params.get("method") or "f"
    
    ipfsdata = loadIpfsFiles(ipfs)
    
    method = params.get('method') or "f"
    
    galaxy = None

    if method == "n":
        galaxy = nested(files, selected, civfile_template, ipfsdata)
    elif method == "f":
        galaxy = flat(files, selected, civfile_template, ipfsdata)

    planets = json.dumps(galaxy, indent=4)

    utils.writefile("planets.json", planets)

    print(planets)

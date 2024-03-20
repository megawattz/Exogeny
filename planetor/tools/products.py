#!/usr/bin/env python3

import os.path
import sys
import json
import ffmpeg
import utils
from pprint import pprint

PACKAGE_PARENT=".."
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

def products(res, civ):
    pprint(civ)
    return civ

if __name__ == "__main__":
    example_civ = {
        "species": "Atlans",
        "culture": "Tribal",
        "generation": 0,
        "infrastructure": 90,
        "manufactured": 80,
        "services": 70,
        "entertainment": 60,
        "woo": 50,
        
        "population": 1000000,
        
        "tritanium44": 1200,
        
        "bio": 10,
        "energy": 20,
        "information": 30,
        "engineering": 40,
        "science": 50,
        "transport": 60,
        "social": 70,
        "warfare": 80,
        "economic": 90,
        "spiritual": 100,
        "art": 110
    }

    example_resources = {
        "atmosphere_composition": "nitrogen",
        "evaluation": "Ancient",
        "evaluation2": "Rogue",

        "lifeform": "Tetrapod",

        "chemistry": "hydrogen_sulfide",

        "planet_type": "vortex",
        
        "rare": 4.7,
        "radioactives": 11.04,
        "refractories": 8.15,
        "industrials": 50.78,
        "specialized": 2.78,
        "biologicals": 9.37,
        "exotics": 1.35,
        "relics": 0.02,
    }

    params, files = utils.fetchArgs(sys.argv[1:], docs= {
        "res":"resources of planet, or @filename to load from file",
        "civ":"civilization data of planet, or @filename to load from file",
        "logfile":"where to log upload URLS"
    })

    products(json.loads(params['res']), json.loads(params['civ']))



        


    


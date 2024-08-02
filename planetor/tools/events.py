#!/usr/bin/python3

import json
import os
import sys
import inspect
import re
import utils
import pymongo
import pprint
import pdb

def help():
    with open(os.path.join(os.path.dirname(__file__), 'event_template.json')) as f:
        eventob = json.load(f)
    with open(os.path.join(os.path.dirname(__file__), 'civilization_template.json')) as f:
        civob = json.load(f)

    return f"""event [query|event] parameter=value selector selector selector
    where command is:
      query - list planets based on selectors that will receive the events
      event - create new events, or modify already existing events but don't push them to any planets
      engage - send events to the planets matching the selectors
      purge - purge all events from the previous cycle (normally done once an hour before sending new events)

   select planets to operate on by specifying various selectors
   where: selectors are: (can be multiple)
      field==value field equals value, like, identity=479303468
      field!=value field not equal value, like, lifeform~=Tetrapod
      field>=value field greater than or equal to value, like, industrials>=27.7
      field>value field greater than value
      field<=value field less than or equal to value
      field@=value1,val2,val3 field equals one of the listed values
      field%=regex field matches regular expression

  options: verbosity=0 no status messages, 9 lots of status messages

  examples: 
     event help
     event query culture==Practical radioactives>=10 bio>=2.3 science<=2
     event event culture==Military warfare>=5 population>=4 plague.event asteroid.event election.event
     event event lifeform==Fungoid warfare>=5 events%=*.event"""

Verbosity = 3
def message(level, *args):
    # This is a placeholder for the actual implementation of the message function
    if level <= Verbosity:
        frame = sys._getframe(1)
        print(f"{os.path.basename(frame.f_code.co_filename)}:{frame.f_lineno}-{level}: ", *args)

def results_to_map(results):
    imap = {}
    for ob in results:
        imap[ob.get('identity')] = json.loads(json.dumps(ob))
    return imap

def parse_selectors(selectors):
    selectors_json = []

    operators = {
        "==":"$eq",
        ">": "$gt",
        "<": "$lt",
        "!=":"$ne",
        "<=":"$lte",
        ">=":"$gte",
        "%=": "$regex",
        "@=":"$in"
    }

    for selector in selectors:
        match = re.match("([A-Za-z_]+)([@=<>~%!]+)(.*)", selector)
        field, op, value = match.groups(1)
        if ',' in value:
            value = re.split(r',', value)
        json_selector = { field : { operators[op]: value }}
        selectors_json.append(json_selector)

    return selectors_json

def get_tech_level(target):
    total_level = sum(target[tech] for tech in Techs)
    return round(total_level * 10 / len(Techs)) / 10

Aspects = {
    "planet": "planet_size,atmosphere_density,star_system,star_index,planet_index,evaluation,evaluation2,planet_type,unexplored",
    "resources": "lifeform,chemistry,atmosphere_composition,rare,radioactives,refractories,industrials,specialized,biologicals,exotics,relics,resources_value,created",
    "civilization": "name,motto,species,culture,generation",
    "assets": "infrastructure,manufactured,services,entertainment,woo,happiness,population,tritanium44",
    "techs": "bio,energy,information,engineering,science,transport,social,warfare,economic,spiritual,art"
}

def merge_map_and_array(map, array_of_maps):
    result = []
    for key in array_of_maps.keys():
        if not map.get(key):
            result.append(array_of_maps[key])
            
    for k, v in map.items():
        result.append({k:v})
        
    return result
        

def process(params, selector_strings):
    message(6, "params:", params)

    selectors = parse_selectors(selector_strings)                                                

    client = pymongo.MongoClient(params.get('server') or "mongodb://mongo:27017")
    
    database = client['exogeny']
    collection = database['planets']
    
    command = params.get('command')
    message(4, f"Action: {command} {selectors}")

    # certain special words are combined aspects (easier to specify output)
    fields = params.get("fields") or "planet,resources,civilization,techs,assets"  #no fields specified will print everything
    for field in Aspects:
        fields = fields.replace(field, Aspects[field])

    message(8, fields)
    project={element: 1 for element in re.split(r'[, ]+', fields) }
    project['identity'] = 1 # always show identity

    # query
    if command == "query":
        project['_id'] = 0  # always suppress mongo id
        documents = collection.find({'$and': selectors }, project)
        for doc in documents:
            pprint.pprint(doc, indent=4)

    # send an event to the galaxy
    elif command == "engage":
        event = json.loads(params['event'])
        selectors = merge_map_and_array(event.limits, selectors)
        result = collection.update_many({ '$and' : selectors }, {"$push": { "events": event}})
        message(3, json.dumps(result.raw_result, indent=4))

    # remove outstanding events from previous cycle
    elif command == "purge":  
        result = collection.update_many({'$and': selectors }, {"$unset": { "events": ""} })
        message(3, json.dumps(result.raw_result, indent=4))
        
    elif command == "event":
        process_events(selectors, files, engage)

if __name__ == "__main__":
    params, queries = utils.fetchArgs(sys.argv[1:], docs={
        "server":"mongo URL: default = mongodb://mongo:27017",
        "command":"*command to game: query, event, engage, help",
        "event":"event file to send to all planets matching selectors",
        "fields":"which fields to display",
        "suppress":"which fields to block",
        "verbosity":"how much data to display: default 3"
    });

    message(4, f"params:{pprint.saferepr(params)} queries:{pprint.saferepr(queries)}") 
    Verbosity = int(params['verbosity']) or "3"
    
    process(params, queries)
        

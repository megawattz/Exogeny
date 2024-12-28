#!/usr/local/bin/node

const Moralis = require("moralis-v1/node");

const Credentials = require("/app/planetor/tools/moralis_dapp_credentials.json")

const Utils = require("/app/planetor/tools/utils");

const fs = require('fs');

var params = Utils.fetchArgs(process.argv.slice(2), {
    "collection":"The moralis object/collection/table to insert this",
    "limit":"only do this many",
    "skip": "dont do the first skip number of items",
    "verbosity":"how much extra information to show (default 2)",
    "delay":"pause this many milliseconds between requests to avoid rate limiter"
});

//console.log(JSON.stringify(Credentials));

var args = params[0];
var files = params[1];

console.log("args:", args);

Moralis.start({ serverUrl: Credentials.serverUrl, appId: Credentials.appId, masterKey: Credentials.masterKey });

const  CollectionName = args['collection'] || console.error("Error: arguments required: collection=NAME FILENAMES") && process.exit(-1)
console.log("Object Type:", CollectionName);

var idx = 0;
const verbosity = parseInt(args.verbosity || "2")
const skip = parseInt(args.skip || "0");
const limit = parseInt(args.limit || "0")
const delay = parseInt(args.delay || "1000");
let uploaded = 0;

if (verbosity > 2)
    console.log(files);

async function doit() {
    for (idx in files) {
	console.log(`${idx} ${files[idx]}`);
	if (skip > 0 && idx <= skip)
	    continue;
	console.log(`Processing ${idx} ${files[idx]}`);
	var file = files[idx];
	const content = fs.readFileSync(file, {encoding: 'utf8', flag: 'r'});
	var temp = JSON.parse(content)
	const attribs = remap(temp);
	//console.log("attributes:", attribs);

	const query = new Moralis.Query(CollectionName)
	query.equalTo("identity", attribs.identity)
	var thing = await query.first({"useMasterKey":true});

	if (thing) {
	    console.log(`${idx} Found ${JSON.stringify(thing)}`);
	    thing.set(attribs);
	    console.log(`${idx} Write ${JSON.stringify(thing)}`);
	} else {
	    console.log("Not Found");
	    thing = new Moralis.Object(CollectionName, attribs);
	    console.log(`${idx}) Write ${JSON.stringify(thing)}`);
	}
	
	await Utils.sleep(1000);
	result = await thing.save(null, {"useMasterKey": true})
	console.log(`${idx}) RESULT ${JSON.stringify(result)}`);
	++uploaded;
	if (limit > 0 && uploaded >= limit)
	    break;
    }	
    console.log(`${uploaded} files uploaded`);
}		

doit();

function remap(object) {
    // Moralis won't accept a record with "id" as the key. This thing here rewrites JSON to change key names if necessary
    const Remap = {
	"id": "",
	"scene": "",
	"camera_location": "",
	"camera_angle": "",
	"camera_look_at": "",
	"sun_brightness": "",
	"sun_position": "",
	"planet_size": "",
	"background": "",
	"planet": "",
	"clouds_size": "",
	"clouds": "",
	"clouds_density": "",
	"atmosphere": "",
	"atmosphere_density": "",
	"atmosphere_size": "",
	"moons": "",
	"moon_position": "",
	"moon_size": "",
	"moon": "",
	"rings": "",
	"random_color": "",
	"random_float": "",
	"random_trans": ""
    };

    // add these
    const Merge = {
//	"warfare": 0,
//	"economic": 0,
//	"spiritual": 0
    };	
    
    var newObject = {...object, ...Merge };
    
    for (k in Remap) {
	if (k in newObject) {
	    var newkey = Remap[k]
	    if (newkey == null)
		continue;
	    if (newkey != "") {
	    	newObject[newkey] = object[k]
	    }
	    delete newObject[k];
	}
    }

    return newObject;
}


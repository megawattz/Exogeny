#!/usr/local/bin/node

const Utils = require("/app/planetor/tools/utils");

const fs = require('fs');

const { MongoClient } = require('mongodb');

function help() {
    let contents = fs.readFileSync(__dirname+'/event_template.json');
    let eventob = JSON.parse(contents);
    
    contents = fs.readFileSync(__dirname+'/civilization_template.json');
    let civob = JSON.parse(contents);

    return `event [query|event] parameter=value <query selectors> eventfile eventfile eventfile eventfile ...
    where command is:
      query - list planets based on selectors that will receive the events
      event - create new events, or modify already existing events but don't push them to any planets
      engage - send events to the planets matching the selectors

   civilization selectors:
      ${JSON.stringify(civob, null, 4)}

   select planets to operate on by specifying various selectors
   where: selectors are: (can be multiple)
      field==value field equals value, like, identity=479303468
      field~=value field no equal value, like, lifeform~=Tetrapod
      field}=value field greater than or equal to value, like, industrials}=27.7
      field}value field greater than value
      field{=value field less than or equal to value
      field@value1,val2,val3 field equals one of the listed values

  options: verbosity=0 no status messages, 9 lots of status messages

  examples: 
     event help
     event query culture==Practical radioactives}=10 bio}=2.3 science{=2
     event event culture==Military warfare}=5 population=}4 plague.event asteroid.event election.event
     event event lifeform==Fungoid warfare}=5 events/*.event`;
}

function resultsToMap(results) {
    var imap = {};
    for (let i = 0; i < results.length; ++i) {
	const ob = results[i];
	imap[ob.get('identity')] = JSON.parse(JSON.stringify(ob));
    }
    return imap;
}

async function mongoQuery(collection, selectors, options) {
    const query = new Moralis.Query(collection);
    
    for (k in options)
	if (query[k])
	    query[k](options[k]);

    query.limit(2000);
    
    Utils.message(6, `SELECTORS: ${JSON.stringify(selectors)}`);
    for (const field in selectors) {
	const selector = selectors[field];
	Utils.message(6, `SELECTOR:${JSON.stringify(selector)}`);
	if (selector.op == '==')
	    query.equalTo(field, selector.value);
	else if (selector.op == '~=')
	    query.notEqualTo(field, selector.value);
	else if (selector.op == '}')
	    query.greaterThan(field, parseFloat(selector.value));
	else if (selector.op == '}=')
	    query.greaterThanOrEqualTo(field, parseFloat(selector.value));
	else if (selector.op == '{')
	    query.lessThan(field, parseFloat(selector.value));
	else if (selector.op == '{=')
	    query.lessThanOrEqualTo(field, parseFloat(selector.value));
	else if (Array.isArray(selector.value))
	    query.containedIn(field, selector.value);
	else if (selector.op == '@=')
	    query.containedIn(field, selector.value.split(/,/));
    }

    Utils.message(4, `QUERY: ${collection} ${JSON.stringify(query, null, 4)}`);
    
    const results = await query.find({"useMasterKey":true});

    Utils.message(2, `RESULT COUNT: ${collection} ${results.length}`);

    return results;
}

async function GetPlanetsAndCivilizations(selectors) {

    var planetSelectors = {};
    const planetKeys = "identity,lifeform,chemistry,evaluation,evaluation2,planet_type,rare,radioactives,refractories,industrials,specialized,biologicals,exotics,relics";
    for (const key in selectors) {
	if (planetKeys.indexOf(key) == -1)
	    continue
	planetSelectors[key] = selectors[key];
    }
    Utils.message(7, `PLANET SELECTORS:${JSON.stringify(planetSelectors, null, 4)}`);
    if (Object.keys(planetSelectors).length < 1)
	throw Error("Must have at least one planet level selector: " + planetKeys);
    
    var civSelectors = {};
    const civKeys = "identity,culture,population,knowledge,infrastructure,manufactured,services,entertainment,woo,population,tritanium44,bio,energy,information,engineering,science,transport,social,warfare,economic,spiritual,art";

    for (const key in selectors) {
	if (civKeys.indexOf(key) == -1)
	    continue;
	civSelectors[key] = selectors[key];
    }
    Utils.message(7, `CIVILIZATION SELECTORS:${JSON.stringify(civSelectors, null, 4)}`);
    if (Object.keys(civSelectors).length < 1)
	throw Error("Must have at least one civilization level selector: " + civKeys);
    
    var planets = await moralisQuery("Planet", planetSelectors);
    var planetMaps = resultsToMap(planets);
    Utils.message(6, `Planet identities: ${Object.keys(planets)}`);
    civSelectors['identity'] = {op:'@=', value: Object.keys(planetMaps)}; // restrict civilization search to only those planets already selected (in addition to other restrictions)

    var civs = await moralisQuery("Civilization", civSelectors);
    var civMaps = resultsToMap(civs);

    var merge = {};

    for (var key in planets) {
	if (key in civs) {
	    Utils.message(6, `MERGE: ${key}`);
	    var temp = Object.assign({}, planetMaps[key], civMaps[key]);  // put maps in merge
	    temp.civ = civs[key];  // but keep original query objects in civ and planet
	    temp.planet = planets[key];
	    merge[key] = temp; // only include matching civilizations and planets
	}
    }
    
    Utils.message(6, `${JSON.stringify(merge, null, 4)}`);
    Utils.message(2, `${Object.keys(merge).length} civilizations to be given events`);

    // VERY TRICKY merge is a synthesis of keys from civilization and planets together, merge.civ is just the
    // civilization (the only part that can be saved back to Moralis) merge.planet is the planet part only which should
    // not be saved back to Moralis (it can be, but the game logic dictates planets are immutable, only civilizations
    // change). Why are they two separate objects. Too hard to explain but a clue is, to recreate the planet visually,
    // the planet JSON is saved right in the MP4 NFT file as metadata.
    return merge;
}

function ifEligible(planet, events) {
    var allowed = [];
	for (var idx in events) {
	    let event = events[idx];
	    	Utils.message(6, `checking event eligibility ${JSON.stringify(event, null, 4)}`);
	    	let eligible = true;
	    	let limits = event.get("limits")
	    	if (!limits)
		    break; //no limits? it's eligible
	    	for (var idx2 in limits) {
		    let limit = limits[idx2];
		    if (!eval(limit)) {
			Utils.message(3, `Planet Lifeform ${JSON.stringify(planet, null, 4)}`);
			    Utils.message(3, `limit:${limit} not met for this event.`);
			    eligible = false;
			    break;
			}
		}	
		if (eligible)
		    allowed.push(event);
	}
	return allowed;
}

let Techs = ['bio', 'energy', 'information', 'engineering', 'science', 'transport', 'social', 'warfare', 'economic', 'spiritual', 'art'];

function getTechLevel(target) {
    var totalLevel = 0;
    Techs.forEach(function(tech) {
	let level = target[tech];
	totalLevel += level;
    });
    return Math.round(totalLevel * 10 / Techs.length) / 10;
}

async function Process() {
    
    new MongoClient
const { MongoClient } = require('mongodb');
    
	const Node = process.argv.shift(); // remove node.js from the command args
	const App = process.argv.shift(); // remove events.js from the command args

	const Params = Utils.parseMoralisDbArgs(process.argv);

	const Command = Params[0]
	const Selectors = Params[1];
	const Other = Params[2];
	const Files = Params[3];

	Utils.message(6, "Command:", Command);
	Utils.message(6, "Generic Parameters:", Other);
	Utils.message(6, "Query Selectors:", Selectors);

	if (Other && Other.verbosity)
		Utils.Verbosity = Other.verbosity;

	if (Command == "help") {
		console.log(help());
		process.exit(0);
	}

	var engage = false;

	switch (Command) {
		default: {
			console.log(help());
			process.exit(0);
		}
		break;

		case "query": {
			Utils.message(2, "Querying Matching Civilizations");
			var targets = await GetPlanetsAndCivilizations(Selectors);
			Utils.message(3, JSON.stringify(targets, null, 4));
		}
		break;

		case "engage": // a bit tricky. event just uploads events, engage uploads events AND hits planets with them
			engage = true;
		case "event": {
			// create Event records as needed in the database (load from disk file)
			Utils.message(2, "Loading Events");
		    	var events2civs = [];
			for (var idx in Files) {  // load all the specified event files
				const filename = Files[idx];
				var eventname;
				filename.replaceAll(/([^/]+)([.])/g, function (f, g) { eventname = g; });
				Utils.message(4, `Event filename:${filename} = eventname:${eventname}`);
				const finds = await moralisQuery("Event", { "identity": { "op": "==", "value": eventname } });
				var contents = fs.readFileSync(filename);
				Utils.message(6, contents.toString());
				var ob = JSON.parse(contents);
				var event;
				if (finds.length > 0) {
					event = finds[0];
				    	Utils.message(5, `Already Existing, update ${event.get("identity")}`);
				    	ob.LastPushed = new Date();
				        event.set(ob);
					//result = await event.save(null, {"useMasterKey":true});
				    	//Utils.message(2, `Updated ${result.identity}`)
				}
				else {
					Utils.message(4, `Create New Event from file ${filename}`);
				    	ob.identity = eventname;
				    	ob.LastPushed = new Date();
					event = new Moralis.Object('Event', ob);
					//result = await event.save(null, { "useMasterKey": true })
					//Utils.message(2, `New Event Object ${JSON.stringify(result, null, 4)}`);
				}

				Utils.message(5, `Loaded event ${eventname}`);
			        let newevent = await event.save(null, {"useMasterKey": true });
			    	events2civs.push(newevent); // add event to list of events we will hit civilizations with
				Utils.message(5, `Adding Events ${events2civs}`);
			}

		    	Utils.message(6, `New Events: ${JSON.stringify(events2civs, null, 4)}`);
		    
			if (!engage)
				break;

		    	if (Object.keys(Selectors).length == 0)
			    throw new Error("Must provide selectors");

			// If engaging, hit the selected planets with the events
			Utils.message(5, "Querying Matching Civilizations");
			var merges = await GetPlanetsAndCivilizations(Selectors);
			Utils.message(5, `Civilizations:\n${JSON.stringify(merges, null, 4)}`);
			// now hit each target the event
			var success = 0;
		    	var errors = 0;
		    	var unixTimestamp = Math.floor(Date.now()/1000)
			for (var idx in merges) {
			    try {
				var civ = merges[idx].civ;
				Utils.message(4, `Civilization (before fetch) ${JSON.stringify(civ, null, 4)}`);
				civ.fetch();
				civ.level = getTechLevel(civ);
				Utils.message(4, `Civilization (after fetch) ${JSON.stringify(civ, null, 4)}`);
				Utils.message(5, `Pre eligible new events ${JSON.stringify(events2civs, null, 4)}`);
				var eligibleEvents = ifEligible(civ, events2civs); // events may have built in restrictions like gaseous creatures cannot do mining
				Utils.message(5, `eligible new events ${JSON.stringify(eligibleEvents, null, 4)}`);
				Utils.message(5, `civ events before adding: ${JSON.stringify(civ.events, null, 4)}`);
				var eventlist = civ.get("events");
				if (eventlist == null)
				    eventlist = [];
				eventlist.push(...eligibleEvents); // put new events at top of event list
				Utils.message(5, `new events after adding: ${JSON.stringify(eventlist, null, 4)}`);
				let result = await civ.save({"lastevent": unixTimestamp, "events": eventlist}, { "useMasterKey": true })
				Utils.message(2, `Result of saving civ: ${JSON.stringify(result, null, 4)}`);
				++success;
				} catch (ex) {
					++errors;
					Utils.message(1, `Error ${ex} ${ex.stack.split("\n")[1]} with Civilization ${civ["identity"]} ${JSON.stringify(civ, null, 4)}`);
					Utils.message(4, `${ex.stack}`);
				}
			}
			Utils.message(2, `${success} civilizations successfully modified, ${errors} errors`);
			break;
		}
	}
}

async function Wait(func) {
	try {
		await func();
	} catch (e)	{
		let stack = e.stack.split("\n")[1];
		if (Utils.Verbosity >= 6)
			stack = e.stack+"\n";
		    
		Utils.message(0, `ERROR: ${stack} ${e.message}\nHELP:\n${help()}`);
	}
	process.exit(0);
}

Wait(Process);

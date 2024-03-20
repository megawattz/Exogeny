#!/usr/local/bin/node

const Moralis = require("moralis-v1/node");

const Credentials = require("/app/planetor/tools/moralis_dapp_credentials.json")

const Utils = require("/app/planetor/tools/utils");

const fs = require('fs');

function help() {
    let contents = fs.readFileSync(__dirname+'/event_template.json');
    let eventob = JSON.parse(contents);
    
    contents = fs.readFileSync(__dirname+'/civilization_template.json');
    let civob = JSON.parse(contents);

    return `event [query|event] parameter=value <query selectors> file file file file ...
    where command is:
      query - list planets based on selectors (see below section on selectors)
      send - send an event file to the planets matching the selectors

   sending events to planets, what are the effects?
      eventfile - contains the narrative of the event, and default values of the following parameters...

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

async function moralisQuery(collection, selectors) {
    const query = new Moralis.Query(collection);
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

    Utils.message(6, `QUERY: ${collection} ${JSON.stringify(query, null, 4)}`);
    
    const results = await query.find();

    Utils.message(6, `RESULT: ${JSON.stringify(results, null, 4)}`);

    return results;
}

async function GetPlanetsAndCivilizations(selectors) {

    var civSelectors = {};
    for (const key in selectors) {
	if ("identity,culture,population,knowledge,infrastructure,manufactured,services,entertainment,woo,population,tritanium44,bio,energy,information,engineering,science,transport,social,warfare,economic,spiritual,art".indexOf(key) == -1)
	    continue
	civSelectors[key] = selectors[key];
    }
    //Utils.message(7, `CIVILIZATION SELECTORS:${JSON.stringify(civs, null, 4)}`);
    
    var planetSelectors = {};
    for (const key in selectors) {
	if ("identity,lifeform,chemistry,evaluation,evaluation2,planet_type,rare,radioactives,refractories,industrials,specialized,biologicals,exotics,relics".indexOf(key) == -1)
	    continue
	planetSelectors[key] = selectors[key];
    }
    Utils.message(7, `PLANET SELECTORS:${JSON.stringify(civs, null, 4)}`);

    // civilizations are MUCH more likely to be the more restrictive selection (we don't want to download the entire database)
    var civsMoralis = await moralisQuery("Civilization", civSelectors);
    var civs = resultsToMap(civsMoralis);
    Utils.message(4, `Civs identities: ${Object.keys(civs)}`);
    planetSelectors['identity'] = {op:'@=', value: Object.keys(civs)}; // add the list of civ identities to the selectors of planets so we only grab planets that are of those civilizations (minimize data download)
    var planetsMoralis = await moralisQuery("Planet", planetSelectors);
    var planets = resultsToMap(planetsMoralis);

    var merge = {};

    for (var key in civs) {
	if (key in planets) {
	    Utils.message(6, `MERGE: ${key}`);
	    var temp = Object.assign({}, planets[key], civs[key]);
	    merge[key] = temp; // only include matching civilizations and planets
	}
    }
    
    Utils.message(5, `${JSON.stringify(merge, null, 4)}`);
    Utils.message(2, `${Object.keys(merge).length} civilizations to be given events`);

    return {merge, civsMoralis, planetsMoralis};
}

 
//if (require.main === module) {
async function Process() {
    Moralis.start({ serverUrl: Credentials.serverUrl, appId: Credentials.appId, masterKey: Credentials.masterKey });

    const Node = process.argv.shift();
    const App = process.argv.shift();
    
    const Params = Utils.parseMoralisDbArgs(process.argv);

    const Command = Params[0]
    const Selectors = Params[1];
    const Other = Params[2];
    const Files = Params[3];
    
    Utils.message(6, "Command:", Command);
    Utils.message(6, "Generic Parameters:",Other);
    Utils.message(6, "Query Selectors:",Selectors);

    if (Command == "help") {
	console.log(help());
	process.exit(0);
    }

    if (Object.keys(Selectors).length == 0)
	throw new Error("Must provide selectors");

    Utils.message(2, "Querying Matching Civilizations");
    var targets = await GetPlanetsAndCivilizations(Selectors);
    
    switch(Command)
    {
	default: {
	    Utils.message(6, help());
	    process.exit(0);
	}
	break;
	
	case "query": {
	    Utils.message(6, JSON.stringify(targets.civMoralis, null, 4));
	}
	break;
	
	case "event": {
	    // create Event records as needed in the database (load from disk file)
	    Utils.message(2, "Loading Events");
	    var events2civs = [];
	    for (var idx in Files) {  // load all the specified event files
		const filename = Files[idx];
		var eventname;
		filename.replaceAll(/([^/]+)([.])/g, function(f,g) { eventname = g; });
		Utils.message(4, `Event filename:${filename} = eventname:${eventname}`);
		const finds = await moralisQuery("Event", {"identity": {"op":"==","value":eventname}});
		var event;
		if (finds.length > 0) {
		    event = finds[0];
		    Utils.message(4, `Already Existing ${event.get("identity")}`);
		}
		else
		{
		    Utils.message(5, `${idx}) Create New Event from file ${eventname}`);
		    var contents = fs.readFileSync(filename);
		    Utils.message(6, contents.toString());
		    var ob = JSON.parse(contents);
		    ob.identity = eventname;
		    event = new Moralis.Object('Event', ob);
		    Utils.message(5, `New Event Object ${JSON.stringify(event, null, 4)}`);
		    result = await event.save({"useMasterKey": true})
		    Utils.message(2, `New Event Object ${JSON.stringify(result, null, 4)}`);
		}

		Utils.message(3, `Loaded event ${eventname}`);
		events2civs.push(event); // add event to list of events we will hit civilizations with 
	    }

	    Utils.message(3, `Adding Events ${Object.keys(events2civs)} to ${Object.keys(targets.merge)}`); 
	    Utils.message(5, `Civilizations to affect: ${JSON.stringify(targets.civsMoralis, null, 4)}`);
	    // now hit each target the event
	    var success = 0;
	    var errors = 0;
	    for (var idx in targets.civsMoralis) {
		try {
		    var target = targets.civsMoralis[idx];
		    if (target.get('events') == null)
			target.set('events', []);
		    target.set('events', events2civs);
		    Utils.message(4, `Adding ${JSON.stringify(events2civs, null, 4)} to Civilization: ${JSON.stringify(target, null, 4)}`);
		    result = await target.save({"useMasterKey": true})
		    Utils.message(2, `Added events ${JSON.stringify(events2civs, null, 4)} to ${target.get("identity")}`);
		    ++success
		} catch(ex) {
		    ++errors;
		    Utils.message(1, `Error ${ex} with Civilization ${target.get("identity")} ${JSON.stringify(target, null, 4)}`);
		}
	    }
	    Utils.message(2, `{success} civilizations successfully modified, {errors} errors`);
	}
    	break;
    }
}

async function Wait(func) {
    try{
	await func();
    } catch(e) {
	Utils.message(0, `${e.stack}\nHELP:\n${help()}`);
    }
    process.exit(0);
}

Wait(Process);

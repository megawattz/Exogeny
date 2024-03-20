#!/usr/local/bin/node

const Moralis = require("moralis-v1/node");

const Credentials = require("/app/planetor/tools/moralis_dapp_credentials.json")

const Utils = require("/app/planetor/tools/utils");

const fs = require('fs');

var Verbosity = 2;
var Depth = 99; // limit messages to stack depth

function stack() {
    const stacker = new Error("get a stack trace");
    var elements = [];
    stacker.stack.replaceAll(/[^/:]+:[0-9]+/g, function(f) { elements.push(f) });
    return elements;
}

function message(verbosity, ...strs) {
    if (verbosity > Verbosity)
	return;
    var elements = stack()
    var stackDepth = elements.length;
    if (stackDepth > Depth)
	return;
    console.error(`${'-'.repeat(stackDepth)} (${verbosity}) ${elements[2]} `, ...strs);
}

function help() {
    var contents = fs.readFileSync(__dirname+'/event_template.json');
    var eventob = JSON.parse(contents);
    
    contents = fs.readFileSync(__dirname+'/civilization_template.json');
    let civob = JSON.parse(contents);
    
    return `event [query|event] parameter=value <query selectors> file file file file ...
    where command is:
      query - list planets based on selectors (see below section on selectors)
      send - send an event file to the planets matching the selectors

   sending events to planets, what are the effects?
      eventfile - contains the narrative of the event, and default values of the following parameters...
      ${JSON.stringify(eventob, null, 4)}

   select planets to operate on by specifying various selectors
   where: selectors are: (can be multiple)
      field==value field equals value, like, identity=479303468
      field~=value field no equal value, like, lifeform~=Tetrapod
      field}=value field greater than or equal to value, like, industrials}=27.7
      field}value field greater than value
      field{=value field less than or equal to value
      field#=no field does not exist, field #=yes field exists
      field@value1,val2,val3 field equals one of the listed values

  examples: 
     event query culture==Practical radioactives}=10 bio}=2.3 science{=2
     send event culture==Military warfare}=5 population=}4 plague.event asteroid.event election.event
`;
}

function resultsToMap(results) {
    var imap = {};
    if (!results)
	return imap;
    for (let i = 0; i < results.length; ++i) {
	const ob = results[i];
	imap[ob.get('identity')] = JSON.parse(JSON.stringify(ob));
    }
    return imap;
}

function schema(collection) {
    var contents = fs.readFileSync(__dirname+`/${collection}_template.json`);
    return JSON.parse(contents);
}

function parseArgs(args) {
    var command = args.shift();
    var other = {};
    var multiple = [];
    var selectors = {};
    for (var index in args) {
	const arg = args[index];
	const hits = arg.match(/([^={}~@#%^+-]+)([={}~@#%^+-][={}~@#%^+-]?)(.*)/);
	message(6, `ARG:${arg} HITS:${hits}`);
	if (hits == null) {
	    multiple.push(arg)
	    continue;
	}
	if (hits[2].length != 2) { // single parameter argument, not a selector
	    message(6, "Args Other",hits);
	    other[hits[1]] = hits[3];
	    if (hits[1] == "verbosity")
		Verbosity=parseInt(hits[3]);
	    if (hits[1] == "depth")
		Depth=parseInt(hits[3]);
	    continue;
	}
	message(6, "Args Selector", hits);
	selectors[hits[1]] = {op: hits[2], value: hits[3]};
    }
    if (command.match(/[={}<>~@#$%^+-]/))
	throw new Error(`command not recognized: ${command}\n${help()}`);
    message(4, `Arguments:\ncommand: ${JSON.stringify(command, null, 4)}\nselectors: ${JSON.stringify(selectors, null, 4)}\nother: ${JSON.stringify(other, null, 4)}\nmultiple: ${JSON.stringify(multiple, null, 4)}`);
    return [command, selectors, other, multiple];
}

async function moralisQuery(collection, selectors, options = {}, displayfields = null) {
    const query = new Moralis.Query(collection);
    message(6, `SELECTORS: ${JSON.stringify(selectors)}`);
    for (const field in selectors) {
	const selector = selectors[field];
	message(6, `SELECTOR:${JSON.stringify(selector)}`);
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
	else if (selector.op == '#=') {
	    if (selector.value == 'no' || selector.value == '0' || selector.value == 'false')
		query.doesNotExist(field);
	    else 
		query.exists(field);
	}
	else throw new Error(`Unrecognized operator: ${selector.op}`);
    }

    if (options['include'])
	query.include(options['include']);
    
    if (options['limit'])
	query.limit(parseInt(options.limit));
    
    if (options['skip'])
	query.skip(parseInt(options.skip));

    if (displayfields)
	query.select(displayfields);
    
    message(4, `QUERY: ${collection} ${JSON.stringify(query, null, 4)}`);
    
    let results;

    if (options['count'])
	results = await query.count();
    else
	results = await query.find();

    message(6, `RESULT: ${JSON.stringify(results, null, 4)}`);

    return results;
}

async function Query(collection, selectors, options, displayfields) {
    var resultsMoralis = await moralisQuery(collection, selectors, options, displayfields);
    return resultsMoralis;
}

function Output(data, options) {
    switch(options.format) {
    default: {
	console.log(JSON.stringify(data, null, 4));
	break;
    }	
    case("console"): { 
	console.log(data)
	break;
    }
    case("single"): { 
	console.log(JSON.stringify(data));
	break;
    }
    }
}
 
async function Process() {
    Moralis.start({ serverUrl: Credentials.serverUrl, appId: Credentials.appId, masterKey: Credentials.masterKey });

    const Node = process.argv.shift();
    const App = process.argv.shift();
    const Params = parseArgs(process.argv);

    const Command = Params[0]
    const Selectors = Params[1];
    const Options = Params[2];
    const DisplayFields = Params[3];
    
    message(6, "Command:", Command);
    message(6, "Generic Parameters:", Options);
    message(6, "Query Selectors:", Selectors);
    message(6, "Display Fields:", DisplayFields);

    switch (Command) {
    case 'schema': {
	console.log(schema(Options.collection));
	return;
	break;
    }
    case 'help': {
	console.log(help());
	return;
	break;
    }
    default: {
    }
    }
    
    if (Object.keys(Selectors).length == 0)
	throw new Error("Must provide selectors");

    message(3, `Query(${Options['collection']} selectors:${JSON.stringify(Selectors)} options:${JSON.stringify(Options)} fields:${DisplayFields}`);
    var results = await Query(Options['collection'], Selectors, Options, DisplayFields);
    if (results)
	message(4, `Results count ${results.length}`);
    var resultMap = resultsToMap(results); // convert to normal javascript objects

    switch (Command) {
    default:
    case 'schema': {
	console.log(schema(Options.collection));
	break;
    }
    case 'query': {
	Output(resultMap, Options);
	break;
    }
    }

    return;
}

async function Wait(func) {
    try{
	await func();
    } catch(e) {
	message(0, `${e.stack}\nHELP:\n${help()}`);
    }
    process.exit(0);
}

Wait(Process);

    

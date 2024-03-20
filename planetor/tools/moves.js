#!/usr/local/bin/node

const Moralis = require("moralis-v1/node");

const Credentials = require("/app/planetor/tools/moralis_dapp_credentials.json")

const Utils = require("/app/planetor/tools/utils");

const fs = require('fs');

var Verbosity = 2;

function message(verbosity, ...strs) {
    if (verbosity > Verbosity)
	return;
    console.log(`(${verbosity})`, ...strs);
}

function help() {
    var contents = fs.readFileSync(__dirname+'/moves_template.json');
    var eventob = JSON.parse(contents);
    
    return `Resolves moves that players have submitted.
    syntax: move [query|resolve|message]  parameter=value <query selectors>
    where command is:
     query - list moves of that type
     resolve - execute users requests or reject them (command==setfield etc.)

   select moves to operate on by specifying various selectors
   where: selectors are: (can be multiple)
      field==value field equals value, like, identity=479303468
      field~=value field no equal value, like, lifeform~=Tetrapod
      field}=value field greater than or equal to value, like, industrials}=27.7 
     field}value field greater than value
      field{=value field less than or equal to value
      field@value1,val2,val3 field equals one of the listed values

  examples: 
     moves query command==setfield, show all the pending setfield moves requested by users
     moves resolve command==influence, resolve all the moves that users have made in response to events occurring on their planets
`;
}

function resultsToMap(results) {
    var imap = {};
    for (let i = 0; i < results.length; ++i) {
	const ob = results[i];
	imap[ob.get('identity')] = JSON.parse(JSON.stringify(ob));
    }
    return imap;
}

function parseArgs(args) {
    var command = args.shift();
    var other = {};
    var selectors = {};
    
    for (var index in args) {
	const arg = args[index];
	const hits = arg.match(/([^={}<>~@#$%^+-]+)([={}<>~@#$%^+-][={}<>~@#$%^+-]?)(.*)/);
	message(6,`ARG:${arg} HITS:${hits}`);
	if (hits[2].length != 2) { // single parameter argument, not a selector
	    message(6,"Other",hits);
	    other[hits[1]] = hits[3];
	    continue;
	}
	message(6,"Selector",hits);
	selectors[hits[1]] = {op: hits[2], value: hits[3]};
	message(6,`SELECTOR ${hits[1]} = ${JSON.stringify(selectors[hits[1]])}`);
    }
    
    message(6,`SELECTORS PARSED:${JSON.stringify(selectors, null, 4)}`);
    if (command.match(/[={}<>~@#$%^+-]/))
	throw new Error(`command not recognized: ${command}\n${help()}`);
    return [command, selectors, other];
}

async function moralisSelectorQuery(collection, selectors) {
    const query = new Moralis.Query(collection);
    message(5,`SELECTORS: ${JSON.stringify(selectors)}`);
    for (const field in selectors) {
	const selector = selectors[field];
	message(5,`SELECTOR:${JSON.stringify(selector)}`);
	if (selector.op == '==')
	    query.equalTo(field, selector.value)
	else if (selector.op == '~=')
	    query.notEqualTo(field, selector.value)
	else if (selector.op == '}')
	    query.greaterThan(field, parseFloat(selector.value))
	else if (selector.op == '}=')
	    query.greaterThanOrEqualTo(field, parseFloat(selector.value))
	else if (selector.op == '{')
	    query.lessThan(field, parseFloat(selector.value))
	else if (selector.op == '{=')
	    query.lessThanOrEqualTo(field, parseFloat(selector.value))
	else if (selector.op == '@=')
	    query.containedIn(field, selector.value.split(/,/))
    }

    message(4,`QUERY: ${collection} ${JSON.stringify(query)}`);
    
    const results = await query.find({'useMasterKey':true});

    message(4,`RESPONSE: ${JSON.stringify(results, null, 4)}`);
    
    return results;
}

async function setfield(move) {
    message(3,`Resolving setfield:\n${JSON.stringify(move, null, 4)}`);
    const query = new Moralis.Query(move.targetCollection);
    query.equalTo("identity", move.targetId);
    const civ = await query.first({'useMasterKey':true});
    message(3,`Found ${JSON.stringify(civ, null, 4)}`);
    civ.set(move.parameters.field, move.parameters.value);
    result = await civ.save(null, {"useMasterKey": true})
    message(3,`Updated ${JSON.stringify(result, null, 4)}`);
    return result;
}

function influence(move) {
    message(3,`Resolving influence:\n${JSON.stringify(move, null, 4)}`);
    /*
    const query = new Moralis.Query(move.targetCollection);
    query.equalTo("identity", move.targetId);
    const civ = await query.first({'useMasterKey':true});
    message(3,`Found ${JSON.stringify(civ, null, 4)}`);
    civ.set(move.parameters.field, move.parameters.value);
    result = await civ.save({"useMasterKey": true})
    message(3,`Updated ${JSON.stringify(result, null, 4)}`);
    return result;
    */
}

//if (require.main === module) {
async function Process() {
    Moralis.start({ serverUrl: Credentials.serverUrl, appId: Credentials.appId, masterKey: Credentials.masterKey });

    const Node = process.argv.shift();
    const App = process.argv.shift();
    const Params = parseArgs(process.argv);

    const Command = Params[0]
    const Selectors = Params[1];
    const Other = Params[2];

    const temp = parseInt(Other['verbosity']);
    if (temp)
	Verbosity = temp;
    console.log(`Verbosity ${Verbosity}`);
    
    message(3,"Command:", Command);
    message(3,"Generic Parameters:",Other);
    message(3,"Query Selectors:",Selectors);

    var moves = resultsToMap(await moralisSelectorQuery("Move", Selectors));

    switch(Command)
    {
	default: {
	    message(3,help());
	    process.exit(0);
	}
	break;
	
	case "query": {
	    message(2,JSON.stringify(moves, null, 4));
	}
	break;
	
	case "resolve": {
	    for (var idx in moves) {
		var move = moves[idx];
		const result = await eval(move['command'])(move);
		message(2,`Updated ${JSON.stringify(result)}`);
	    }
	}
    	break;
    }
}

async function Wait(func) {
    if (Verbosity > 2)
	return await func();

    try{
	await func();
    } catch(e) {
	message(0,`${e}\nHELP:\n${help()}`);
    }
}

Wait(Process);

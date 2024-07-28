export function fetchArgs(args, docs = {}) {
    var params = {};
    var remainder = [];
    var count = 0;
    var mandatory = 0;
    var help = 'Supported Arguments:\n';
    for (let k in docs) {
        let v = docs[k];
        help += `${k}=${v}\n`;
	if (v[0] == '*')
	    mandatory += 1
    }
    if (args.length < mandatory) {
	console.log(help);
        throw new Error("Arguments annotated with * are required");
    }
    for (let i in args) {
        let arg = args[i];
        let hits = arg.match(/-*([^=]*)=(.*)/);
        if (!hits)
            break;
        let key = hits[1]
        let value = hits[2]
        if (!(key in docs))
            throw new Error(`${key} not a recognized parameter, use: ${JSON.stringify(docs, null, 4)}`);
        params[key] = value
        count = count + 1
    }
    return [params, args.slice(count)];
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var Verbosity = 3;
var Depth = 99; // don't show messages who stack depth is higher than this

export function stack() {
    const stacker = new Error("get a stack trace");
    let elements = [];
    stacker.stack.replaceAll(/[^/:]+:[0-9]+/g, function (f) { elements.push(f) });
    return elements;
}

export function message(verbosity, ...strs) {
    if (verbosity > Verbosity)
        return;
    let elements = stack()
    let stackDepth = elements.length;
    if (stackDepth > Depth)
        return;
    console.error(`${'-'.repeat(stackDepth)} ${elements[2]} (${verbosity})`, ...strs);
}

export function parseMongoDbArgs(args) {
    let command = args.shift(); // first argument on command line
    if (command.match(/[={}<>~@#$%^+-]/)) // command must not have any special characters
        throw new Error(`command not recognized: ${command}`);
    let selectors = {};  // key_op_value (op are special 2 character sequences, like name==value  for "name equal to value"
    let other = {}; // key=value type parameters
    let multiple = []; // values without operaters, without key=value, like a filename
    for (let index in args) {
        const arg = args[index];
        const hits = arg.match(/([^={}~@#%^+-]+)([={}~@#%^+-][={}~@#%^+-]?)(.*)/);
        message(6, `ARG:${arg} HITS:${hits}`);
        if (hits == null) {
            multiple.push(arg)
            continue;
        }
        if (hits[2].length != 2) { // single parameter argument, not a selector
            message(6, "Args Other", hits);
            other[hits[1]] = hits[3];
            if (hits[1] == "verbosity")
                Verbosity = parseInt(hits[3]);
            if (hits[1] == "depth")
                Depth = parseInt(hits[3]);
            continue;
        }
        message(6, "Args Selector", hits);
        selectors[hits[1]] = { op: hits[2], value: hits[3] };
    }
    message(4, `Arguments:\ncommand: ${JSON.stringify(command, null, 4)}\nselectors: ${JSON.stringify(selectors, null, 4)}\nother: ${JSON.stringify(other, null, 4)}\nmultiple: ${JSON.stringify(multiple, null, 4)}`);
    return [command, selectors, other, multiple];
}

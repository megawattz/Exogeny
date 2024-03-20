#!/usr/local/bin/nodejs 

import Replicate from "replicate";
import readlineSync from "readline-sync";
import { fetchArgs } from "/app/planetor/tools/utils.mjs"

function getInput(question) {
    var lines = [];

    console.error(question);

    while (true) {
	const line = readlineSync.prompt({ prompt: '', keepWhitespace: false });
	if (line.length < 1)
	    break;
	lines.push(line);
    }

    // Entire input has been read
    const input = lines.join('');

    return input
}

function Run() {
    const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
    });

    var [params, freeargs] = fetchArgs(process.argv.slice(2), {
	"model":"which stable duffusion model to use",
    });

    var prompt = freeargs[0]

    // do not send messages to standard out, only the final output goes to standard out
    console.error("sending request to stable fusion\n",prompt);

    const model = params['model'] || "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4"
    const input = { prompt: prompt };
    const output = replicate.run(model, { input }).then((d) => console.log(d[0]));
}

try {
    Run();
}
catch(ex) {
    console.error(ex);
}

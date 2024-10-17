#!/bin/env python3

import os

import sys
sys.path.insert(0, "/app/planetor/tools")
import utils

import replicate
import utils

if __name__ == "__main__":

    params, prompt = utils.fetchArgs(sys.argv[1:], docs={
        "model":"what OpenAI model to use",
        "type":"The type of prompt (text, sound, image, etc)",
        "text":"If the prompt is textual, you can put it here, or via standard in"
    })

    prompt = params.get("text")
    if not prompt:
        print("Waiting for input on standard in...", file=sys.stderr)
        prompt = sys.stdin.read()

    model = params.get("model") or "adirik/styletts2:dd4d03b097968361dda9b0563716eb0758d1d5b8aeb890d22bd08634e2bd069c";
    prompt_type = params.get("type") or "text"
    
    output = replicate.run(
        model,
        input={
            prompt_type: prompt
        }
    )

    print(output)

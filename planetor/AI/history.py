#!/usr/bin/python3

import openai

import sys
sys.path.insert(0, "/app/planetor/tools")
import utils

sys.path.insert(0, "/app/planetor/history")
import chatgpt_key

import json
import pprint
import re

def openAIquery(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages = [
            {
                "role": "system",
                "content": prompt
            }
        ])
    return response

def history(args):

    query = '''

In 200 words or less, in the present tense, using all your knowledge of science fiction, from the point of view of a
sociologist, extrapolate wildly, but make it sound factual, describe pre-history and subsequent development of an
intelligent pre-technology species currently extant from nothing to the beginnings of civilization. The species form is
{lifeform} and planet type {planet} and they have a culture type that is {culture} at its core. Make up a {lifeform}
sounding planet name which they know. Extrapolate fictional narrative of how their civilization developed but still
lacks technology. Describe their diet, from predatory meat eating to ingesting sunlight. Freely make up {lifeform}
sounding words to describe things about them. Do not describe why you are doing this or anything about yourself. Do not
use any reference to Earth or terrestrial, or Earth dating systems and do not mention their planet name. Add wild,
creative, significant storytelling. Do not include "sunlight" in this description. Include notes on their language,
religion, money, family structure and tech level. Make the history sound factual not fictional. Make us a {lifeform}
sounding name they know their own species by. They have no knowledge of metal working but do not specifically mention
that fact. Do not mention anything about the physical characteristics of the species besides the general lifeform.

    ''' .format(*args, **args)

    return openAIquery(query)

if __name__ == "__main__":

    params, misc = utils.fetchArgs(sys.argv[1:], docs={
        "lifeform":"*form of life, shape (biped, blob, plant, etc.)",
        "planet":"*type of planet (desert, aquatic, terrestrial, etc.)",
        "culture":"*what type of culture they have",
        "identity":"anything. not required. used to label the ps output",
        "output":"all,content"
    })

    rval = history(params)

    output = params.get('output') or 'content'

    if output == 'all':
        print(rval)
        sys.exit(0)

    content = rval['choices'][0]['message']['content']

    content = content.replace('\n', '\\n')

    content = content.replace('"', '\\"')

    print(content)
    
    sys.exit(0)
    

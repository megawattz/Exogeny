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

In 200 words or less, Using all your knowledge of science fiction, from the point of view of a sociologist, extrapolate
wildly, but make it sound factual, describe pre-history and subsequent development an intelligent pre-technology species
currently extant, who call themselves %s on the planet %s from nothing to the beginnings of civilization. The species
form is %s and planet type %s and they have a culture type that is %s at its core. Extrapolate fictional narrative of
how their civilization developed but still lacks technology. Freely make up %s sounding words to describe things about
them. Do not describe why you are doing this or anything about yourself. Do not use any reference to Earth or Earth
dating systems. Add wild, creative, significant storytelling Include notes on their language, religion (or lack of it),
money, family structure (or lack of it) and tech level. Make the history sound factual not fictional.

    ''' % (params['species'], params['name'], params['lifeform'], params['planet'], params['culture'], params['lifeform'])

    return openAIquery(query)

if __name__ == "__main__":

    params, misc = utils.fetchArgs(sys.argv[1:], docs={
        "species":"*what the creatures call themselves",
        "lifeform":"*form of life, shape (biped, blob, plant, etc.)",
        "planet":"*type of planet (desert, aquatic, terrestrial, etc.)",
        "culture":"*what type of culture they have",
        "name":"*the planet official name (for example, Alpha Casovia XII)",
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
    

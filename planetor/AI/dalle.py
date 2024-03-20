#!/usr/bin/python3

import openai
import json

import sys
sys.path.insert(0, "/app/planetor/tools")
import utils

sys.path.insert(0, "/app/planetor/history")
import chatgpt_key

def openAIquery(prompt, count):
    print(prompt, file=sys.stderr)
    response = openai.Image.create(
        prompt=prompt,
        n=count,
        size="1024x1024"
        )
    return response

if __name__ == "__main__":

    params, misc = utils.fetchArgs(sys.argv[1:], docs={
        "count":"how many images to create",
        "output":"filename to write HTML page to"
    })

    count = int(params['count'] or 4)
    
    prompt = misc[0]
    
    rval = json.loads(str(openAIquery(prompt, count)))

    page = "<html>\n<body>\n"
    
    urls = rval['data']

    for item in urls:
        page += '<img src="%s">\n' % item['url']

    page += "</body>\n</html>\n"

    output = sys.stderr
    try:
        output = open(params['output'], mode='w')
    except:
        output = sys.stdout

    print(page, file=output)

    output.close()


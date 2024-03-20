#!/usr/bin/python3

# you must "pip3 install openai"
import openai
import sys
import json

# obtain this at: https://platform.openai.com/account/api-keys
openai.api_key = "YOUR OPENAI API KEY"

#I put mine in a separate module because I don't wnat to check it into github
sys.path.insert(0, "/app/planetor/tools")
import chatgpt_key

# The meat of the progam:

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

if __name__ == "__main__":

    print('''enter prompt, hit control-D when done entering''', file=sys.stderr)
    prompt = sys.stdin.read()
    print('''asking chatgpt, stand by''', file=sys.stderr)
        
    rval = openAIquery(prompt)

    choices = rval.get("choices")

    content = choices[0]['message']['content']

    print(content)

    sys.exit(0)
    

#!/usr/bin/env python3

import sys
import re
import json

def writefile(path, data):
    f = open(path, "wb")
    f.write(bytes(data, 'utf-8'))
    f.close()
    return data

def writefile(path, data):
    f = open(path, "wb")
    f.write(bytes(data, 'utf-8'))
    f.close()
    return data

def readfile(filename):
    f = open(filename, "rb")
    data = f.read()
    f.close()
    return data

ChainMap = {
    "1": "ethereum",
    "11155111":"sepolia",
    "56": "bnb",
    "43114": "avalanche",
    "8453": "base",
    "250": "fantom",
    "361": "theta",
    "80001": "mumbai",
    "137": "polygon",
    "10":"optimism"
}

def chainName(id):
    return ChainMap.get(id)

def fetchArgs(args, docs={}):
    params = {}
    remainder = []
    count = 0
    if (len(args) < 1 or args[0] == 'help'):
        print(f"\n{sys.argv[0]} accepted arguments:\n")
        for k,v in docs.items():
            print("%s=<%s>" % (k, v))
        print("\n* indicates argument required")
        print("@filename means: read entire file 'filename' and use as value to argument, i.e. arg=@myfile")
        return params, args[count:]
    for arg in args:
        hit = re.findall("--([^=]*)=?(.*)", arg)
        if not hit: 
            break
        key = hit[0][0]
        if not key in docs:
            raise Exception("%s not a recognized parameter, use:\n%s" % (key, json.dumps(docs, indent=4)))
        value = hit[0][1]
        if (value[:1] == '@'):
            params[key] = readfile(value[1:]).decode('utf-8')
        if value == '': #key without a parameter means key is True, for example --testmode
            value = True;
        params[key] = value
        count = count + 1
    for k,v in docs.items():
        if docs[k][:1] == '*':
            if params.get(k) == None:
                raise Exception("%s= must be supplied" % k)
        
    return params, args[count:]

def ipfsparse(ipfsurl):
    return re.findall("(.*?ipfs/)([^/]+)/([^.]+)[.]?(.*)", ipfsurl)[0] # return [http, hash, path, extension]

def extract_id(str):
    stuff = re.findall("[0-9]{3,}", str)
    return stuff[0]

digits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

def numToStr(number, radix):
    result = ""
    while number > 0:
        number, rem = divmod(number, radix)
        #print(number, rem)
        result += digits[rem]
    return result

if __name__ == "__main__":
    print(sys.argv)
    #print(fetchArgs(sys.argv[1:]))
    #print(ipfsparse(sys.argv[1]))
    print(numToStr(int(sys.argv[1]),int(sys.argv[2])))
        
        

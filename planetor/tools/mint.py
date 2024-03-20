#!/bin/python3

import requests
from pprint import pprint as pp
import base64
import mimetypes
import sys
import json

API_KEY = "INNMibkxLXWuHzXOmylj5375ovAJx8ygByGjr0EkYGDxKl28FbmbrN7haO6sqkG5"
CONTRACT = "0x0227b5218cb14657ce901ffce39346c680a89fab" # Polygon Mumbai Test Network

class Moralis:
    def __init__(self, api_key = None):
        self.url_base = 'https://deep-index.moralis.io/api/v2/'
        self.api_key = api_key

    def set_api_key(self, api_key):
        self.api_key = api_key

    def api_request_py(self, endpoint, method="GET", data=None, headers_to_add=None):
        headers = {
            "x-api-key": self.api_key
        }
        if headers_to_add:
            Merge(headers_to_add, headers)
        pp(headers)
        response = requests.request(url=self.url_base + endpoint, method=method, headers=headers, data=json.dumps(data) )
        if response.status_code == 200:
            response_object = response.json()
            return response_object
        else:
            pp(vars(response))
            pp(vars(response.request))
            return response.json()
        
    def ipfs_uploadBinary(self, base64_data):
        endpoint = 'ipfs/uploadFolder'
        headers_to_add = {"Content-Type": "application/json", "accept": "application/json"}
        resp = self.api_request_py(endpoint, method='POST', data=base64_data, headers_to_add=headers_to_add)
        pp(resp)
        return 

class Contract:
    def __init__(self, contract_address, contract_abi, api_key):
        self.url_base = 'https://deep-index.moralis.io/api/v2/'
        self.api_key = api_key
        self.contract_address = contract_address
        self.contract_abi = contract_abi

    def mint(self, 
    
def Merge(dict1, dict2):
    return(dict2.update(dict1))

def readfile(filename):
    f = open(filename, "rb")
    data = f.read()
    f.close()
    return data

def mint(base64_data):
    return moralis.ipfs_uploadBinary(base64_data)

if __name__ == "__main__":
    moralis = Moralis(API_KEY)
    contract = Contract(CONTRACT, str(readfile("contracts/NFT/abi.json")), API_KEY)
    
    try:
        source_file = sys.argv[1]
        mime = mimetypes.guess_type(source_file)[0]
        data = readfile(source_file)
        b64 = str(base64.b64encode(data), 'utf-8')
        destination_path = sys.argv[2]
        print("Mime:%s Path:%s" % (mime, destination_path))
        post = [{"path": destination_path, "content": b64}]
        ipfs_file = mint(post)
        pp(ipfs_file)
        contract.mint()
    except Exception as e:
        print(e)
        print("usage: mint.py filename ipfspath")







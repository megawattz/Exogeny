#!/usr/bin/env python3

import time
import subprocess
import planetor
import re
import os
import mimetypes
import json
import sys
import inspect
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import urllib.parse

sys.path.insert(0, 'pylibs')
import ptlib

def execstring(command):        
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    output = ""
    while p.poll() is None:
        temp = p.stdout.read()
        try:
            output += temp.decode("utf-8", errors='replace')
        except:
            output += temp.decode("string_escape", errors='replace')

    return output

hostName = "localhost"
serverPort = 6080

class MyServer(BaseHTTPRequestHandler):
    
    def pyexec(self, code):
        request = inspect.currentframe().f_back.f_back.f_locals
        rval = eval(code.group(1))
        print("EVAL:%s" % rval)
        return rval
              
    def do_GET(self):
        output = ""
        try:
            cwd = os.getcwd()
            print("\n----------------------\nREQUEST:%s"%self.path)
            doc = ""  # default value
            query = ""
            filetype = ""
            queries = {}
            matches = re.search(r'/([^?]*)[?]*(.*)', self.path)
            if matches:
                doc = matches.group(1)
                parts = os.path.splitext(doc)
                filetype = parts[1]
                query = matches.group(2)
                if query:
                    query = urllib.parse.unquote(query)
                    pairs = re.findall(r'([^&=]+)=([^&]*)', query)
                    for key, value in pairs:
                        queries[key] = value
            
            print("doc:%s type:%s query:%s queries:%s dir:%s" % (doc, filetype, query, str(queries), cwd))

            if doc == "generate_planet":  # This should be put in a js file
                print("doing generate")
                options = planetor.generate(queries, ".", "FRAMES=1")
                package = json.dumps(options)
                if 'callback' in queries: # if this is a jsonp call, turn it into a javascript function call
                    package = '%s(%s)' % (queries['callback'], package) 
                self.send_response(200)
                self.send_header("Content-type", "text/javascript")
                self.send_header("Content-length", len(package))
                self.end_headers()
                print(package)
                self.wfile.write(bytes(package, 'utf-8'))

            elif filetype in [".html",".js",".text",".txt"]:  # text files can have regex operations and need to be converted to string first
                print("reading texty file:%s/%s" % (os.getcwd(), doc))
                contents = bytes.decode(planetor.readfile(doc))
                #found = re.findall("<py>(.+?)</py>", contents, re.DOTALL)
                contents, count = re.subn("<py>(.+?)</py>", self.pyexec, contents, 99, re.DOTALL)
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.send_header("Content-length", len(contents))
                self.end_headers()
                self.wfile.write(bytes(contents, 'utf-8'))
          
            else:
                print("reading binary file:%s/%s" % (os.getcwd(), doc))
                contents = planetor.readfile(doc)
                self.send_response(200)
                self.send_header("Content-type", mimetypes.guess_type(doc))
                self.send_header("Content-length", len(contents))
                self.end_headers()
                self.wfile.write(contents)

        except Exception as e:
            ex, val, tb = sys.exc_info()
            error_text = traceback.format_exception(ex, val, tb)
            print(''.join(error_text))
            self.send_response(400)
            self.send_header("Content-type", "text/plain")
            self.send_header("Content-length", len(error_text))
            self.end_headers()
            try:
                self.wfile.write(bytes.decode(error_text))
            except:
                pass

if __name__ == "__main__":        
    webServer = ThreadingHTTPServer(("0.0.0.0", serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

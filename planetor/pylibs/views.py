from cgitb import reset
from django.shortcuts import render
from . import planetor
from django.http import JsonResponse
import mimetypes
import os
import re

def generate_planet(request):
    selections = request.GET
    res = planetor.generate(selections, "/app/planetor", "FRAMES=1")
    return JsonResponse(res)

def readfile(filename):
    f = open(filename, "rb")
    data = f.read()
    f.close()
    return data

# recreate an already generated planet using its spec file in "specs"
def regenerate_planet(id):
    options = readfile("specs/%s.json", id)
    selections = json.loads(options)
    res = planetor.generate(selections, "/app/planetor", "FRAMES=1")
    return JsonResponse(res)

def edit_options(request):
    return render(request, 'planetor/edit_options.html')

def my_planets(request):
    return render(request, 'planetor/my_planets.html')

def dirlist(request):  #ajax: /dirlist?directory=stills&filemask=*.gif
    selections = request.GET
    list = os.listdir(selections['directory'])
    rval = []
    for filename in list:
        if re.search(selections['mask'], filename):
            rval.append(filename)
    return JsonResponse({"files":rval})

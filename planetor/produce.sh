#!/bin/bash

# keep generating planets for an auto refresh web page

(while true; do FRAMES=100 ./planetor; done ) &

sleep 30

(while true; do FRAMES=100 ./planetor; done ) &

sleep 30

(while true; do FRAMES=100 ./planetor; done) 



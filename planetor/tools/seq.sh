#!/bin/bash

COUNT=$1
echo "[$(seq -s, 0 ${COUNT})]";

MINUS=$(($COUNT-1))
echo -n "[";
for N in $(seq 0 ${MINUS} ); do echo -n "1," ; done;
echo "1]";




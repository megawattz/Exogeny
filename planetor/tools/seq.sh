#!/bin/bash

START=$1
COUNT=$2
echo "[$(seq -s, ${START} ${COUNT})]";

MINUS=$(($COUNT-1))
echo -n "[";
for N in $(seq ${START} ${MINUS} ); do echo -n "1," ; done;
echo "1]";




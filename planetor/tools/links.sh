#!/bin/bash

SYSTEM=$1

for GREEK in $(cat /app/planetor/names/greeks.txt); do
    for ROMAN in $(cat /app/planetor/names/romans.txt); do
	echo "$GREEK $SYSTEM $ROMAN"
    done;
done;


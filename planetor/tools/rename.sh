#!/bin/bash

NAMES=/app/planetor/names

for SYSTEM in $(cat ${NAMES}/systems.txt); do
    for STAR in $(cat ${NAMES}/greeks.txt); do
	for PLANET in $(cat ${NAMES}/romans.txt); do
	    echo "${STAR} ${SYSTEM} ${PLANET}";
	done;
    done;
done;



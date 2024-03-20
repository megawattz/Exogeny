#!/bin/bash

# create a file called "systems.txt" in your current directory which will contain the star systems of your star map

NAMES=/app/planetor/names

mapfile -t ROMANS < ${NAMES}/romans.txt

for SYSTEM in $(cat systems.txt); do
    for STAR in $(cat ${NAMES}/greeks.txt); do
	offset=1;
	for INDEX in $(seq 0 $((RANDOM % 10)) ); do
	    if [ $((RANDOM % 10)) -lt 3 ]; then
		((offset++));
	    fi
	    FILE=$1
	    echo $FILE
	    if [[ -z "$FILE" ]]; then exit 0; fi
	    shift
	    roman=$(( ${INDEX}+offset ));
	    PLANET=${ROMANS[$roman]};
	    #echo $STAR $SYSTEM $roman=${ROMANS[$roman]};
	    setmeta.py ${FILE} star_system=${SYSTEM} star_index=${STAR} planet_index=${PLANET}
	done;
    done;
done;


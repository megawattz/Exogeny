#!/bin/bash

# create a file called "systems.txt" in your current directory which will contain the star systems of your star map

NAMES=/app/planetor/names

mapfile -t ROMANS < ${NAMES}/romans.txt

for SYSTEM in $(cat systems.txt); do
    for STAR in $(cat ${NAMES}/greeks.txt); do
	for INDEX in $(seq 1 10 ); do
	    FILE=$1
	    echo $FILE
	    if [[ -z "$FILE" ]]; then exit 0; fi
	    shift
	    roman=${INDEX}
	    PLANET=${ROMANS[$roman]};
	    #echo $STAR $SYSTEM $roman=${ROMANS[$roman]};
	    jq --arg system ${SYSTEM} --arg star ${STAR} --arg planet ${PLANET} \
	       '.star_system = $system | .star_index = $star | .planet_index = $planet' ${FILE} > tmp.json
	    cp -v tmp.json ${FILE}
	done;
    done;
done;


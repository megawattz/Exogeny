#!/bin/bash -vx

date
set

function generate {
cd $(dirname $0)

APP=$(pwd)

FRAMES=${FRAMES:=1}
DELAY=${DELAY:=10}
WIDTH=${WIDTH:=1024}
HEIGHT=${HEIGHT:=768}
FINAL_CLOCK=${FINAL_CLOCK:=1.0}

GALLERY=${APP}/out/gallery
STILLS=${APP}/out/stills
DRAFTS=${APP}/out/drafts
SPECS=${APP}/out/specs          # planeteer parameters that went into making this planet MP4
LOGS=${APP}/out/logs
CIVILIZATION=${APP}/out/civilization
LIFEFORMS=${APP}/out/lifeforms

# FRAMES environment variable can be set before you run ./generate.sh in case you want to test before doing a full animation.

if [ $FRAMES -lt 10 ]; then
    GALLERY=${DRAFTS}
fi

NICE="nice -n 10 "

if [ $FRAMES -lt 2 ]; then
    GALLERY=${STILLS}
    # make single frame previews fast, don't nice them down
    NICE=
fi

if [ $FRAMES -lt 1 ]; then
    exit 0
fi

IDENTITY=${1}   # a random number (pid number) uses to create all files and directories related to this planet

SPECSFILE="${SPECS}/specs_${IDENTITY}.json"
cat ${SPECSFILE}

CIVFILE="${CIVILIZATION}/civilization_${IDENTITY}.json"
cat ${CIVFILE}

STARSYSTEM=$(cat $SPECSFILE | jq -r .star_system) # name of the planet and description passed in by planetor.py
echo $STARSYSTEM
STARINDEX=$(cat $SPECSFILE | jq -r .star_index)
PLANETINDEX=$(cat $SPECSFILE | jq -r .planet_index)
BACKGROUND=$(cat $SPECSFILE | jq -r .background)
RESOURCES=$(cat $SPECSFILE | jq -r .resources_value)
ARTIST=$(cat $SPECSFILE | jq -r .artist)
AUDIO=$(cat $SPECSFILE | jq -r .audio)
CULTURE=$(cat $CIVFILE | jq -r .culture)
SPECIES=$(cat $CIVFILE | jq -r .species)
NOW=$(date +%Y-%m-%d-%H:%M:%S-%Z)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REVISION=$(git rev-parse --short HEAD)
GIT_INFO="${BRANCH}-${REVISION} $NOW"
DESCRIPTION="${STARINDEX} ${STARSYSTEM} ${PLANETINDEX}"

POVDIR="${APP}/out/povs"
POVPATH=${POVDIR}/${IDENTITY}.pov

#cp -vfl ${POVPATH} planet.pov

RENDIR=${APP}/out/rendir/${IDENTITY}
RENPATH=${RENDIR}/image.png

mkdir -p $STILLS
mkdir -p $DRAFTS
mkdir -p $POVDIR
mkdir -p $RENDIR
mkdir -p $LIFEFORMS
mkdir -p $GALLERY  # where the animations are stored when done

function extras() {
    # if already running lifeform.mjs for this planet, return
    if ps -axl | grep -v grep | grep identity=${IDENTITY}; then
	return;
    fi
    
    LIFEFORM_FILE="${APP}/out/lifeforms/lifeform_${IDENTITY}.png"
    # we already have a file?
    ls -l "${LIFEFORM_FILE}";
    if [ -f "${LIFEFORM_FILE}" ]; then
	return
    fi

    LIFEFORM_URL=$(${APP}/AI/lifeforms.mjs identity=${IDENTITY} specsfile=${SPECSFILE}) 
    wget -O ${LIFEFORM_FILE} ${LIFEFORM_URL}
    #rm -f ${LIFEFORM_FILE}.work
    #convert -pointsize 20 -fill white -draw "text 0, 0 \" The Dominant Indigenous Species of ${STARINDEX} ${STARSYSTEM} ${PLANETINDEX}\"" -gravity southwest ${LIFEFORM_FILE} ${LIFEFORM_FILE}.work  # write the description text into the image in the lower left
    #cp -vf ${LIFEFORM_FILE}.work ${LIFEFORM_FILE}
}

# remove previous still, it causes confusion in the UI because the user cannot tell if a new planet has been rendered or not if the old one pops up still
rm -f ${STILLS}/planet_${IDENTITY}.gif

# if genrating only one frame, create a single frame better than frame 0
if [ $FRAMES -gt 1 ]; then
    ${NICE} povray ${POVPATH} Output_File_Name=${RENPATH} Initial_Frame=1 Final_Frame=${FRAMES} Initial_Clock=0.0 Final_Clock=${FINAL_CLOCK} Cyclic_Animation=on Width=${WIDTH} Height=${HEIGHT} Verbose=Off
    HISTORY=$(${APP}/AI/history.py --lifeform=${LIFEFORM} --planet=${PLANETTYPE} --culture=${CULTURE})
    jq ". += {\"history\":\"${HISTORY}\"}" ${SPECSFILE} > ${SPECSFILE}.tmp
    mv -vf ${SPECSFILE}.tmp ${SPECSFILE}
    COMBINED=$(jq -s '.[0] * .[1]' ${SPECSFILE} ${CIVFILE} )
    mongo "exogeny.planets.replace_one({'identity':\"${IDENTITY}\"};${COMBINED};True)"
else
    ${NICE} povray ${POVPATH} Output_File_Name=${RENPATH} Initial_Clock=0.6 Initial_Frame=120 Cyclic_Animation=on Width=${WIDTH} Height=${HEIGHT} Verbose=Off
    HISTORY=$(${APP}/AI/history.py --lifeform=${LIFEFORM} --planet=${PLANETTYPE} --culture=${CULTURE})
fi

( # so that returning restores original directory
    cd ${RENDIR}
    pwd
    chmod a+rwx *
    convert -scale ${WIDTH}x${HEIGHT}+0+0 ${APP}/backgrounds/${BACKGROUND} ${BACKGROUND}.work  # we need to modify this so make our own copy
    cp -vf ${BACKGROUND}.work ./${BACKGROUND}
    
    ${NICE} composite \( ${APP}/artists/${ARTIST} -resize 20% -geometry +700+720 \) ./${BACKGROUND} ${BACKGROUND}.work
    cp -vf ${BACKGROUND}.work ./${BACKGROUND}
	    
    chmod a+rw ${APP}/*

    rm -f planet.mp4 # delete possible sample rendering from before

    METADATA=$(cat ${SPECS}/specs_${IDENTITY}.json | jq -c)
    
    ${NICE} ffmpeg -framerate 10 -pattern_type glob -i '*.png' -i ./${BACKGROUND} \
	 -filter_complex "[0:v]curves=all='0/0 0.2/0 1/1'[c];[c]scale=1024:768[scaled];[1:v][scaled]overlay=0.0" \
	 -metadata minor_version="${REVISION}" -metadata artist="${ARTIST}" -metadata album="${IDENTITY}" -metadata title="${DESCRIPTION}" \
	 -movflags faststart -pix_fmt yuva420p -r 10 planet1.mp4

    if [ $FRAMES -gt 1 ] && [[ ! "$AUDIO" =~ "None" ]]; then
    	${NICE} ffmpeg -i planet1.mp4 -i ${APP}/audio/${AUDIO} -t 00:00:20 -c copy -map 0:v -map 1:a planet.mp4
    else
	mv -vf planet1.mp4 planet.mp4
    fi

    #${NICE} ffmpeg -i planet1.mp4 -vf "minterpolate" -c:v libx264 -preset veryfast -crf 18 -c:a copy planet.mp4

    HALF=$((${FRAMES}/2))  # get half the number of frames (halfway through the video makes the best snapshot)
    rm -f ${STILLS}/planet_${IDENTITY}.gif
    ${NICE} ffmpeg -i planet.mp4 -vf "select=eq(n\,${HALF})" -vframes 1 ${STILLS}/planet_${IDENTITY}.gif
    
    chmod a+rw planet.gif planet.mp4;
    rm -f *.png;
)

# we are done with creating the animation, the remaining steps are distributing and optimizing the animation

# the most recent finished animation is symbolically linked to the
# planets directory so you leave a image viewer sitting there and it
# will continually display the new planets are they are being created.

# lifeform images and history

cp -vlf ${RENDIR}/planet.mp4 ${GALLERY}/planet_${IDENTITY}.mp4

#rm -rf ${RENDIR}/

extras;

# make one set of links for the most recent planet rendered
#cp -vlf ${GALLERY}/planet_${IDENTITY}.mp4 planet.mp4
#cp -vlf ${STILLS}/planet_${IDENTITY}.gif planet.gif

}

time generate $@;

cat -n ${POVPATH}

#!/bin/bash

SCRIPT_DIR=$(dirname $0)

. ${SCRIPT_DIR}/parse_args.sh 

parse_args "$@";

frame=${frame:?you must provide which frame number in the movie you want as the still}
outtype=${outtype:?you must prove an image file type for the output, gif, png, jpg etc.}

for file in "${PARMS[@]}"; do
    outname="$(pwd)/$(basename ${file%.*}).${outtype}";
    echo "${file} => ${outname}";
    ffmpeg -i ${file} -vf "select=eq(n\,${frame})" -vframes 1 "${outname}";
done


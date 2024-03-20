#!/bin/bash

parse_args() {
    declare -gA named_params
    declare -g PARMS=()

    for arg in "$@"; do
        if [[ $arg == --*=* ]]; then
            param="${arg#--}"
            name="${param%%=*}"
            value="${param#*=}"
            declare -g "$name"="$value"
            named_params["$name"]="$value"
        else
            PARMS+=("$arg")
        fi
    done
}


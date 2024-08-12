#!/bin/bash

cd $(dirname $0)

mkdir -p planetor/out
( # subshell restores default directory after doing the following
    cd planetor/out;
    mkdir -p civilization  deploy  drafts  gallery  lifeforms  logs  povs  rendir  specs  stills;
)

( # subshell
    cd contracts/NFT/.workspaces/PlaneteerNFT/contracts
    remixd &
)

# copy saved credentials to /root directory which only exists at runtime
#cp -rv /app/.cloudflared /root
#cloudflared tunnel route dns 6b0f0c06-c8f1-40ce-8ec6-389c0c029a42 '*.exoplaneteer.com'
#cloudflared tunnel run 6b0f0c06-c8f1-40ce-8ec6-389c0c029a42 &

python3 manage.py runserver 0.0.0.0:80







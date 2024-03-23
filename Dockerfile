FROM node:18.16-bullseye

# general unix tools
RUN apt update -y && apt install apt-utils

RUN apt install -y \
    curl \
    wget \
    python3 \
    xz-utils \
    less \
    tmux \
    unzip \
    binutils \
    psutils \
    rsync \
    procps \
    vim \
    ngrep \
    tcpdump \
    jq \
    fim \
    net-tools

ENV PATH="${PATH}:/app/planetor/tools"

# graphics tools
RUN apt install -y povray povray-doc povray-examples povray-includes imagemagick ffmpeg


# django
RUN apt install -y python3-django python3-pip

COPY requirements.txt .

RUN pwd && ls -al

RUN pip3 install -r requirements.txt

COPY . /app

WORKDIR /app

#RUN npm install npm@9.6.6 replicate readline-sync @remix-project/remixd parcel three
RUN npm install npm@9.6.6 replicate readline-sync @remix-project/remixd parcel

RUN wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i cloudflared-linux-amd64.deb



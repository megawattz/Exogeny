#FROM node:18.17-bullseye
FROM debian:bookworm-slim

RUN apt-get upgrade -y

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
    "inetutils-*" \
    net-tools

ENV PATH="${PATH}:/app/planetor/tools"

# graphics tools
RUN apt install -y povray povray-doc povray-examples povray-includes imagemagick ffmpeg

# django
RUN apt install -y python3-django python3-pip python3-pymongo

WORKDIR /app

RUN cd /tmp && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

RUN cd /tmp && curl -qL https://www.npmjs.com/install.sh | sh

#RUN npm install replicate readline-sync @remix-project/remixd parcel three
RUN npm install -g replicate readline-sync @remix-project/remixd parcel

RUN wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i cloudflared-linux-amd64.deb

RUN apt-get install -y pipx python3-aiohttp python3-aiosignal python3-asgiref python3-async-timeout \
    python3-certifi python3-chardet python3-charset-normalizer python3-distlib python3-mercurial \
    python3-django-cors-headers python3-filelock python3-frozenlist python3-future python3-gunicorn \
    python3-idna python3-multidict python3-packaging python3-platformdirs \
    python3-psutil python3-pydantic python3-requests python3-roman \
    python3-six python3-sqlparse python3-tqdm python3-urllib3 python3-virtualenv python3-virtualenv-clone \
    python3-wand python3-yarl

RUN pwd

RUN apt-get install -y python3-pillow python3-django python3-full

RUN python3 -m venv /usr/lib/python3.11
RUN ln -sf /lib/python3.11/bin/pip /usr/bin/pip
ENV PYTHONPATH=/usr/lib/python3.11/lib/python3.11/site-packages

RUN pip install ffmpeg-python openai pytz replicate

COPY . .





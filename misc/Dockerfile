#FROM mongo:8.0.0-rc8-jammy
FROM debian:bookworm-slim

RUN apt update -y && apt install -y apt-utils curl gpg

RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# general unix tools
RUN apt update -y && apt install -y apt-utils mongodb-org

RUN apt install -y \
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
    net-tools \
    git \
    make

RUN cd /tmp && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

RUN apt install -y strace

RUN cd /tmp && curl -qL https://www.npmjs.com/install.sh | sh

RUN npm cache clean --force

RUN npm install -g mongodb sprintf-js strftime express cors ethers

WORKDIR /app

COPY serve.sh .
COPY server .

ENV NODE_PATH=/usr/lib/node_modules

# You must run all this install stuff inside the container, with this directory mounted then exit and rebuild




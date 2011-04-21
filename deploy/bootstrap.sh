#!/bin/bash
## Provision script used to build Hyperarchy environment on Linode Ubuntu 10.04 LTS disk image

HOST=rails.hyperarchy.com

## put public key in authorized_keys on remote host
#ssh root@$HOST "mkdir ~/.ssh && echo `cat id_rsa.pub` > ~/.ssh/authorized_keys"

## copy rvm-compatible .bashrc into place
scp -i keys/id_rsa .bashrc root@$HOST:~

ssh -i keys/id_rsa root@rails.hyperarchy.com <<'ENDSSH'
## set the timezone to UTC
ln -sf /usr/share/zoneinfo/UTC /etc/localtime

## update packages
#yes | apt-get update
#yes | apt-get upgrade

## create hyperarchy user
#mkdir /home/hyperarchy
#useradd hyperarchy -d /home/hyperarchy -s /bin/bash

## install git
#yes | apt-get install git-core

## install postgresql
#yes | apt-get install postgresql
#su - postgres
#createuser hyperarchy --createdb --no-superuser --no-createrole
#exit

## install rvm
#bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)
#rvm get latest
#source /usr/local/rvm/scripts/rvm

## install ruby mri dependencies
yes | apt-get install \
  build-essential bison openssl libreadline6 libreadline6-dev curl \
  zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-0 libsqlite3-dev sqlite3 libxml2-dev \
  libxslt-dev autoconf libc6-dev ncurses-dev

## install ruby 1.9.2
rvm install 1.9.2-p180

ENDSSH

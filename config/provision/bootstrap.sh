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
yes | apt-get install postgresql libpq-dev
#su - postgres
#createuser hyperarchy --createdb --no-superuser --no-createrole
#exit

## install nginx
#yes | apt-get install libpcre3-dev build-essential libssl-dev
#cd /opt/
#wget http://nginx.org/download/nginx-0.8.54.tar.gz
#tar -zxvf nginx-0.8.54.tar.gz
#cd /opt/nginx-0.8.54/
#./configure --prefix=/opt/nginx --user=nginx --group=nginx --with-http_ssl_module
#make
#make install
#adduser --system --no-create-home --disabled-login --disabled-password --group nginx
#wget https://library.linode.com/web-servers/nginx/installation/reference/init-deb.sh
#mv init-deb.sh /etc/init.d/nginx
#chmod +x /etc/init.d/nginx
#/usr/sbin/update-rc.d -f nginx defaults
#/etc/init.d/nginx start

## install rvm
#bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)
#rvm get latest
source /usr/local/rvm/scripts/rvm

## install ruby mri dependencies
#yes | apt-get install \
#  build-essential bison openssl libreadline6 libreadline6-dev curl \
#  zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-0 libsqlite3-dev sqlite3 libxml2-dev \
#  libxslt-dev autoconf libc6-dev ncurses-dev

## install ruby 1.9.2
#rvm install 1.9.2-p180

# install bundler
rvm use 1.9.2-p180 --default
gem install bundler --version 1.0.12

ENDSSH

## copy ssl certificate and key into place
#scp -i keys/id_rsa certs/hyperarchy.crt root@$HOST:/etc/ssl/certs/
#scp -i keys/id_rsa certs/hyperarchy.key root@$HOST:/etc/ssl/private/

## copy nginx configuration into place
#scp -i keys/id_rsa nginx.conf root@$HOST:/opt/nginx/conf/nginx.conf
#ssh -i keys/id_rsa root@rails.hyperarchy.com "/etc/init.d/nginx reload"

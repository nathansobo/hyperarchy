#!/bin/bash
export PATH=/opt/node/bin:$PATH
cd /app/vendor/socket_server
exec node ./socket_server.js

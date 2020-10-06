#!/bin/bash
docker-compose up -d
export PORT=3000
export REDIS_ADDRESS=redis://localhost:6379
export MONGODB_URI=mongodb://localhost:27017/cz_messenger
export MESSENGER_NAMESPACE=/v1/sockets/messenger
export SOCKET_PATH=/v1/sockets/socket.io
export SHOP_SERVICE=http://api.chozoi.com/v1/shops
npm run dev

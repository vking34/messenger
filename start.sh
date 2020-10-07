#!/bin/bash
docker-compose up -d
export PORT=3002
export REDIS_ADDRESS=redis://localhost:6379
export MONGODB_URI=mongodb://localhost:27017/cz_messenger
export MESSENGER_NAMESPACE=/v1/conversations/events
export SOCKET_PATH=/v1/conversations/sockets
export SHOP_SERVICE=http://api.chozoi.com/v1/shops
npm run dev

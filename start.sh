#!/bin/bash
docker-compose up -d
export PORT=3002
export REDIS_ADDRESS=redis://localhost:6379
export MONGODB_URI=mongodb://localhost:27017/cz_messenger
export MESSENGER_NAMESPACE=/v1/conversations/events
export AUCTION_RESULT_NAMESPACE=/v1/conversations/auction-result-events
export SOCKET_PATH=/v1/conversations/sockets
export SHOP_SERVICE=http://api.chozoi.com/v1/shops
export KAFKA_BOOTSTRAP_SERVERS=172.26.12.211:9092
export SCHEMA_REGISTRY_URL=http://172.26.12.211:8081
export KAFKA_APP_ID=auction-consumer-node-local
export CONSUMER_GROUP_ID=auction-event-consumer-node-local
export AUCTIONS_RESULT_NAMESPACE=/v1/conversations/auctions-result-events
npm run dev
# npm run start

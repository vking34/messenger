import { Kafka } from 'kafkajs';
import { SchemaRegistry, AvroKafka } from '@ovotech/avro-kafkajs';
import { AuctionResult } from '../interfaces/auctionResult';
import boardcastAuctionResult from '../sockets/newAuctionResultEvent';

export default async () => {
    const schemaRegistry = new SchemaRegistry({ uri: process.env.SCHEMA_REGISTRY_URL });
    const kafka = new Kafka({
        clientId: 'auction-consumer-node',
        brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS]
    });
    const avroKafka = new AvroKafka(schemaRegistry, kafka);

    const consumer = avroKafka.consumer({ groupId: 'auction-event-consumer-node' })
    await consumer.connect();
    await consumer.subscribe({
        topic: 'chozoi.socket.auction.result'
    });
    await consumer.run<AuctionResult>({
        eachMessage: async ({ message }) => {
            boardcastAuctionResult(message.value);
        }
    });
};

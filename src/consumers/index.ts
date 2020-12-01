// import { Kafka } from 'kafkajs';
// import { SchemaRegistry, AvroKafka } from '@ovotech/avro-kafkajs';
// import { AuctionEvent } from '../interfaces/auctionResult';
// import boardcastAuctionEvent from '../sockets/newAuctionResultEvent';

// const {
//     SCHEMA_REGISTRY_URL,
//     KAFKA_BOOTSTRAP_SERVERS,
//     KAFKA_APP_ID,
//     CONSUMER_GROUP_ID,
// } = process.env;

// export default async () => {
//     const schemaRegistry = new SchemaRegistry({ uri: SCHEMA_REGISTRY_URL });
//     const kafka = new Kafka({
//         clientId: KAFKA_APP_ID,
//         brokers: [KAFKA_BOOTSTRAP_SERVERS]
//     });
//     const avroKafka = new AvroKafka(schemaRegistry, kafka);
//     const consumer = avroKafka.consumer({ groupId: CONSUMER_GROUP_ID })
//     let connected = false;

//     while (!connected) {
//         try {
//             await consumer.connect();
//             await consumer.subscribe({
//                 topic: 'chozoi.socket.auction.result'
//             });
//             await consumer.run<AuctionEvent>({
//                 eachMessage: async ({ message }) => {
//                     boardcastAuctionEvent(message.value);
//                 }
//             });
//             connected = true;
//         }
//         catch (e) {
//             console.log(e);
//         }
//     }
// };

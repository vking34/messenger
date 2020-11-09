import KafkaAvro from 'kafka-node-avro';
import sendAuctionResult from '../sockets/newAuctionResultEvent';

const settings = {
     kafka: {
          kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS
     },
     schema: {
          registry: process.env.SCHEMA_REGISTRY_URL,
          topics: [{ name: 'chozoi.socket.auction.result' }]
     }
}

KafkaAvro.init(settings)
     .then((kafka) => {
          let biddingConsumer = kafka.addConsumer(
               'chozoi.socket.auction.result', {
               groupId: 'auction-event-consumer-node'
          });

          biddingConsumer.on('message', auctionResult => {
               console.log(auctionResult);
               sendAuctionResult(auctionResult.value);
          })
     }).catch((_e) => {
          console.log(_e);
     });


export default KafkaAvro;


// import kafka from 'kafka-node';

// const Consumer = kafka.Consumer;
// // const Offset = kafka.Offset;
// const Client = kafka.KafkaClient;

// const kafkaClient = new Client({
//      kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
// });

// const biddingTopic = [{ topic: 'chozoi.auction.results', partition: 3 }]
// const options = {
//      groupId: 'bidding-consummer-node',
//      autoCommit: false,
//      fetchMaxWaitMs: 1000,
//      fetchMaxBytes: 4 * 1024 * 1024
// }
// let biddingConsumer = new Consumer(kafkaClient, biddingTopic, options);



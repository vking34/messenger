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
               'chozoi.socket.auction.result',
               {
                    groupId: 'auction-event-consumer-node'
               }
          );

          biddingConsumer.on('message', auctionResultMessage => {
               sendAuctionResult(auctionResultMessage.value);
          })
     }).catch((_e) => {
          console.log(_e);
     });


export default KafkaAvro;

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
        const consumerOptions = {
            groupId: 'auction-event-consumer',
            fromOffset: 'latest',
            // commitOffsetsOnFirstJoin: true,
            autoCommit: true,
            // protocol: ['roundrobin']
            // outOfRangeOffset: 'latest'
        }

        let biddingConsumer = kafka.addConsumer(
            'chozoi.socket.auction.result',
            consumerOptions
        );

        biddingConsumer.on('message', auctionResultMessage => {
            // console.log('auction id:', auctionResultMessage.value.id);

            sendAuctionResult(auctionResultMessage.value);
        })
    }).catch((_e) => {
        console.log(_e);
    });


export default KafkaAvro;

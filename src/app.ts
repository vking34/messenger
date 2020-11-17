import express from 'express';
import path from 'path';
import http from 'http';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import monogoose from 'mongoose';
import cors from 'cors';

// configs
const port = process.env.PORT || 3000;
const app = express();
export const server = http.createServer(app);

// db
monogoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
monogoose.Promise = global.Promise;
monogoose.connection.once('open', () => {
    console.log('Connected to mongoDB!');
});

// middlewares
app.use('/v1/conversations/test', express.static(path.join(__dirname, '../public')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

// sockets
require('./sockets/index');

// kafka consumers
import startAuctionResultConsumer from './consumers/index';
startAuctionResultConsumer();

// routes
import messageRoute from './routes/message';
import roomRoute from './routes/room';

app.use('/v1/conversations/rooms', roomRoute);
app.use('/v1/conversations/messages', messageRoute);

// start server
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

process.on('unhandledRejection', (reason, _promise) => {
    console.log('Unhandled Rejection at:', reason);
});

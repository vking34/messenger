import express from 'express';
import path from 'path';
import http from 'http';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import monogoose from 'mongoose';
import cors from 'cors';

// routes
import roomRoute from './routes/room';
import messageRoute from './routes/message';

// configs
// require('dotenv').config();
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
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev'));
app.use(bodyParser.json());


// sockets
require('./sockets/index');

// routes
app.use('/v1/conversations/rooms', roomRoute);
app.use('/v1/conversations/messages', messageRoute);

app.use(cors());

// start server
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});






// const cleanUpServer = async (options, exitCode) => {
//     console.log(options);
//     console.log(exitCode);
//     await redisClient.flushallAsync('ASYNC');
// }

// ['exit', 'SIGTERM'].forEach((eventType) => {
//     process.on(eventType, cleanUpServer.bind(null, eventType));
// })

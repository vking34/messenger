import express from 'express';
import path from 'path';
import http from 'http';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import redisAdapter from 'socket.io-redis';
import { Server, Socket } from 'socket.io';
import monogoose from 'mongoose';
import cuid from 'cuid';

// types
import { RoomCreation } from './requests/room';
import { MessageFormat } from './requests/message';

// routes
import roomRoute from './routes/room';
import messageRoute from './routes/message';

// models
import { MessageModel } from './models/message';
import RoomModel from './models/room';

// configs
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const MESSENGER_NS = process.env.MESSENGER_NAMESPACE;

// db
monogoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
monogoose.Promise = global.Promise;
monogoose.connection.once('open', () => {
    console.log('Connected to mongoDB!');
});

// socket
const io: Server = require('socket.io')(server);
io.adapter(redisAdapter({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));


// middlewares
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev'));
app.use(bodyParser.json());

// routes
app.use('/v1/rooms', roomRoute);
app.use('/v1/messages', messageRoute);

// start server
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});


// socket events
var numUsers: number = 0;
io.of(MESSENGER_NS).on('connection', (socket: Socket) => {
    console.log('socket query: ', socket.handshake.query);
    const { token, user_id, user_role } = socket.handshake.query;

    // check token
    console.log(token);
    // if (token !== 'access_token')
    //     socket.disconnect();

    // mark user id and join the own room
    socket['user_id'] = user_id;
    socket.join(user_id);

    // mark user role 
    socket['user_role'] = user_role;

    // create room
    socket.on('create_room', (room: RoomCreation) => {
        // console.log(room);
        room._id = room.buyer + '.' + room.seller;

        // test
        socket['user_id'] = room.creator;
        socket.join(room.creator);
        //

        io.of(MESSENGER_NS).to(room.creator).emit('create_room', room);

        RoomModel.findById(room['_id'], (_e, record) => {
            if (!record)
                RoomModel.create(room).catch(_e => { });
        });
    })

    // when the client emits 'new message', this listens and executes
    socket.on('new_message', (msg: MessageFormat) => {
        const { from, to } = msg;
        msg._id = cuid();   // generate message id

        io.of('/messenger').to(from).emit('new_message', msg);
        io.of('/messenger').to(to).emit('new_message', msg);

        MessageModel
            .create({
                ...msg,
                is_seen: false
            })
            .then(record => {
                RoomModel
                    .updateOne({ _id: msg.room_id }, { last_message: record }, (_e, _r) => { });
            })
            .catch((_e) => { });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', async (data) => {
        // console.log("typing: ", data);
        const { from, to } = data;

        socket.to(from).emit('typing', data);
        socket.to(to).emit('typing', data);
    });

    // when the client emits 'stop_typing', we broadcast it to others
    socket.on('stop_typing', async (data) => {
        // console.log("stop_typing: ", data);
        const { from, to } = data;

        socket.to(from).emit('stop_typing', data);
        socket.to(to).emit('stop_typing', data);
    });

    // the client have seen message
    socket.on('seen_messages', async (data) => {
        // console.log('seen messages:', data);
        const { room_id } = data;

        socket.to(data.to).emit('seen_messages', data);

        // update messages in the message collection
        MessageModel
            .updateMany({ _id: { $in: data.message_ids } }, { is_seen: true })
            .catch(_e => { });

        // update the last message in the room
        var room: any = await RoomModel.findById(data.room_id);
        if (room.last_message._id === data.message_ids[0]) {
            room.last_message.is_seen = true;
            RoomModel
                .updateOne(
                    { _id: room_id },
                    { last_message: room.last_message })
                .catch(_e => { });
        }
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        // console.log(socket['user_id'], 'disconnected!');

        socket.leave(socket['user_id']);
        socket.broadcast.emit('user left', {
            username: socket['user_id'],
            numUsers: numUsers
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('set usernames', (data) => {
        const { from } = data;
        // store the username in the socket session for this client
        socket['user_id'] = from;
        ++numUsers;

        socket.join(from);

        socket.emit('login', {
            numUsers: numUsers
        });

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket['user_id'],
            numUsers: numUsers
        });
    });
})


// const cleanUpServer = async (options, exitCode) => {
//     console.log(options);
//     console.log(exitCode);
//     await redisClient.flushallAsync('ASYNC');
// }

// ['exit', 'SIGTERM'].forEach((eventType) => {
//     process.on(eventType, cleanUpServer.bind(null, eventType));
// })
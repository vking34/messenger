import express from 'express';
import path from 'path';
import http from 'http';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import redisAdapter from 'socket.io-redis';
import { Socket } from 'socket.io';
import monogoose from 'mongoose';
import cuid from 'cuid';

// routes
import roomRoute from './routes/room';
import userRoute from './routes/user';
import messageRoute from './routes/message';

// models
import Message from './models/message';

// configs
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// db
monogoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
monogoose.Promise = global.Promise;
monogoose.connection.once('open', () => {
    console.log('Connected to mongoDB!');
});

// socket
const io = require('socket.io')(server);
io.adapter(redisAdapter({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));


// middlewares
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev'));
app.use(bodyParser.json());

// routes
app.use('/blogs', roomRoute);
app.use('/users', userRoute);
app.use('/messages', messageRoute);

// start server
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});


// socket events
var numUsers: number = 0;
io.on('connection', (socket: Socket) => {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new_message', (msg) => {
        const { sender, receiver } = msg;
        msg._id = cuid();

        console.log(msg);
        io.to(sender).emit('new_message', msg);
        io.to(receiver).emit('new_message', msg);

        if(msg.sender.localeCompare(msg.receiver) > 0)
            var room_id: string = msg.receiver as string + '.' + msg.sender as string;
        else
            var room_id: string = msg.sender as string + '.' + msg.receiver as string; 

        Message.create({
            ...msg,
            room_id,
            type: 'SSB',
            is_seen: false
        })
        .catch((error: any) => {
            console.log(error);
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', async (data) => {
        const { sender, receiver } = data;
        console.log(data, " typing");

        io.to(sender).emit('typing', data);
        io.to(receiver).emit('typing', data);
    });

    // when the client emits 'stop_typing', we broadcast it to others
    socket.on('stop_typing', async (data) => {
        const { sender, receiver } = data;
        console.log(data, " stop_typing");

        io.to(sender).emit('stop_typing', data);
        io.to(receiver).emit('stop_typing', data);
    });

    // the client have seen message
    socket.on('seen_messages', (data) => {
        console.log('seen messages:', data);
        
        if(data.sender.localeCompare(data.receiver) > 0)
            data.room_id = data.receiver as string + '.' + data.sender as string;
        else
            data.room_id = data.sender as string + '.' + data.receiver as string; 
        
        socket.to(data.receiver).emit('seen_messages', data);
        Message
        .updateMany({_id: { $in: data.message_ids}}, {is_seen: true})
        .catch(e => {
            console.log(e);
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;
            console.log(socket['username'], ' disconnected!');

            socket.leave(socket['username']);
            socket.broadcast.emit('user left', {
                username: socket['username'],
                numUsers: numUsers
            });
        }
    });

    // when the client emits 'add user', this listens and executes
    socket.on('set usernames', (data) => {
        if (addedUser) return;

        const { sender } = data;
        // store the username in the socket session for this client
        socket['username'] = sender;
        ++numUsers;
        addedUser = true;

        socket.join(sender);

        socket.emit('login', {
            numUsers: numUsers
        });

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket['username'],
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
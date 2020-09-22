import express from 'express';
import path from 'path';
import http from 'http';
import redisClient from './redis_client';


const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

var numUsers: number = 0;

io.on('connection', (socket) => {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', async (data) => {

        // get receiver socket id in cache
        // let receiverSocketId: string = await redisClient.getAsync(data.receiver);
        // console.log(data);
        // console.log('target socket:' + receiverSocketId);

        // if (receiverSocketId) {
        //     io.to(receiverSocketId).emit('new message', data);
        // }
        
        console.log(data);
        const {receiver} = data;
        socket.join(receiver);
        
        io.to(receiver).emit('new message', data);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
        if (addedUser) return;

        socket.join(username);
        
        // store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        
        // save {username: socket.id} into cache
        console.log("socket ID:", socket.id);
        redisClient.setAsync(username, socket.id);

        socket.emit('login', {
            numUsers: numUsers
        });

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', async (data) => {
        // let receiverSocketId: string = await redisClient.getAsync(data.receiver);
        // if (receiverSocketId)
        //     io.to(receiverSocketId).emit('typing', data);

        const {receiver} = data;
        io.to(receiver).emit('typing', data);
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', async (data) => {
        // let receiverSocketId: string = await redisClient.getAsync(data.receiver);
        // if (receiverSocketId)
        //     io.to(receiverSocketId).emit('stop typing', data);
        const {receiver} = data;
        io.to(receiver).emit('stop typing', data);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;
            console.log(socket.username, ' disconnected!');

            // redisClient.setAsync(socket.username, '');

            socket.leave(socket.username);

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
})
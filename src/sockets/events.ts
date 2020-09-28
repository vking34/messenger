// import server from '../app';
// import redisAdapter from 'socket.io-redis';
// import { Socket } from 'socket.io';

// // socket
// const io = require('socket.io')(server);
// io.adapter(redisAdapter({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));


// // socket events
// var numUsers: number = 0;
// io.on('connection', (socket: Socket) => {
//     var addedUser = false;

//     // when the client emits 'new message', this listens and executes
//     socket.on('new message', (data) => {
//         const { sender, receiver } = data;

//         console.log(data);
//         io.to(sender).emit('new message', data);
//         io.to(receiver).emit('new message', data);
//     });

//     // when the client emits 'add user', this listens and executes
//     socket.on('set usernames', (data) => {
//         if (addedUser) return;

//         const { sender } = data;
//         // store the username in the socket session for this client
//         socket['username'] = sender;
//         ++numUsers;
//         addedUser = true;

//         socket.join(sender);

//         socket.emit('login', {
//             numUsers: numUsers
//         });

//         // echo globally (all clients) that a person has connected
//         socket.broadcast.emit('user joined', {
//             username: socket['username'],
//             numUsers: numUsers
//         });
//     });

//     // when the client emits 'typing', we broadcast it to others
//     socket.on('typing', async (data) => {
//         const { sender, receiver } = data;
//         console.log(data, " typing");

//         io.to(sender).emit('typing', data);
//         io.to(receiver).emit('typing', data);
//     });

//     // when the client emits 'stop typing', we broadcast it to others
//     socket.on('stop typing', async (data) => {
//         const { sender, receiver } = data;
//         console.log(data, " stop typing");

//         io.to(sender).emit('stop typing', data);
//         io.to(receiver).emit('stop typing', data);
//     });

//     // when the user disconnects.. perform this
//     socket.on('disconnect', () => {
//         if (addedUser) {
//             --numUsers;
//             console.log(socket['username'], ' disconnected!');

//             socket.leave(socket['username']);
//             socket.broadcast.emit('user left', {
//                 username: socket['username'],
//                 numUsers: numUsers
//             });
//         }
//     });
// })
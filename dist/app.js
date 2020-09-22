"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
// import socketio from 'socket.io';
const app = express_1.default();
const server = http_1.default.createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});
var numUsers = 0;
io.on('connection', (socket) => {
    var addedUser = false;
    console.log(socket.id);
    // console.log(socket.client);
    // when client emits 'new message'
    socket.on('new message', data => {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });
    // when added client
    socket.on('add user', username => {
        if (addedUser)
            return;
        socket.username = username;
        ++numUsers;
        addedUser = true;
        // we store the username in the socket session for this client
        socket.emit('login', {
            numUsers
        });
        // echo globally (all clients) that a 
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers
        });
    });
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });
    socket.on('disconnect', () => {
        if (addedUser)
            --numUsers;
        socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers
        });
    });
});
//# sourceMappingURL=app.js.map
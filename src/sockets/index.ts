import { server } from '../app';
import { Server, Socket } from 'socket.io';
import redisAdapter from 'socket.io-redis';

export const MESSENGER_NS = process.env.MESSENGER_NAMESPACE;

// events
import disconnectEvent from './disconnectEvent';
import handleNewMessageEvent from './newMessageEvent';
import handleNewRoomEvent from './newRoomEvent';
import handleTypingEvent from './typingEvent';
import handleStopTypingEvent from './stopTypingEvent';
import handleSeenMessageEvent from './seenMessageEvent';
import handleVerifyUser from './verifyUserEvent';

console.log(process.env.SOCKET_PATH);
console.log(MESSENGER_NS);

// init socket server
const socketOptions = {
    path: process.env.SOCKET_PATH,
    origins: '*:*'
}
const io: Server = require('socket.io')(server, socketOptions);
// const io: Server = require('socket.io')(server);
io.adapter(redisAdapter(process.env.REDIS_ADDRESS));

// socket middlewares
io.of(MESSENGER_NS).use((socket: Socket, next) => {
    console.log('socket query: ', socket.handshake.query);
    let { token, user_id, user_role } = socket.handshake.query;

    // check token
    if (token) {
        // mark user id and join the own room
        socket['user_id'] = user_id;
        console.log('user:', socket['user_id'], 'connected.');

        socket.join(user_id);

        // mark user role
        socket['user_role'] = user_role;

        return next();
    }
    else {
        return next(new Error('Authentication Error'));
    }
});


// socket events
export default io.of(MESSENGER_NS).on('connection', (socket: Socket) => {

    // event: 'create_room' - create room
    handleNewRoomEvent(io, socket);

    // event: 'new_message'
    handleNewMessageEvent(io, socket);

    // event: 'typing'
    handleTypingEvent(io, socket);

    // event: 'stop_typing'
    handleStopTypingEvent(io, socket);

    // event: 'seen_message' - the client have seen message
    handleSeenMessageEvent(io, socket);

    // event: 'disconnect'
    disconnectEvent(io, socket);

    // event: 'verify_user' - when user reconnect, we must verify again
    handleVerifyUser(io, socket);
});

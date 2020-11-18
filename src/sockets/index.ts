import { server } from '../app';
import { Server, Socket } from 'socket.io';
import redisAdapter from 'socket.io-redis';
export const MESSENGER_NS = process.env.MESSENGER_NAMESPACE;
export const AUCTION_RESULT_NS = process.env.AUCTION_RESULT_NAMESPACE;

import scanActiveUsers from './scanActiveUsers';

// init socket server
const socketOptions = {
    // server
    path: process.env.SOCKET_PATH,  // custom path
    // serveClient: false,             // do not allow files to client (socket.io.js) (for production)
    origins: '*:*',                 // allow all origins with any port

    // engine
    transports: ['websocket'],      // fix transport protocol to websocket
    cookie: false,                  // do not send cookie (up to usecase) 
    cookiePath: false               // do not save cookie (up to usecase)
}
const io: Server = require('socket.io')(server, socketOptions);
io.adapter(redisAdapter(process.env.REDIS_ADDRESS));

// 1. Messenger Namespace
// 1.1. Middlewares
io.of(MESSENGER_NS).use((socket: Socket, next) => {
    // console.log('socket query: ', socket.handshake.query);
    let { token, user_id, user_role } = socket.handshake.query;

    // ! TODO(vuong, khanh): check token
    if (token) {
        // mark user id and join the own room
        socket['user_id'] = user_id;
        socket.join(user_id);

        // mark user role
        socket['user_role'] = user_role;

        return next();
    }
    else {
        return next(new Error('Authentication Error'));
    }
});

// 1.2. Events
import disconnectEvent from './disconnectEvent';
import handleNewMessageEvent from './newMessageEvent';
import handleNewRoomEvent from './newRoomEvent';
import handleTypingEvent from './typingEvent';
import handleStopTypingEvent from './stopTypingEvent';
import handleSeenMessageEvent from './seenMessageEvent';
import handleVerifyUser from './verifyUserEvent';


io.of(MESSENGER_NS).on('connection', (socket: Socket) => {

    // event: 'create_room' - create room
    handleNewRoomEvent(io, socket);

    // event: 'new_message'
    handleNewMessageEvent(io, socket);

    // event: 'typing'
    handleTypingEvent(io, socket);

    // event: 'stop_typing'
    handleStopTypingEvent(io, socket);

    // event: 'seen_messages' - the client have seen message
    handleSeenMessageEvent(io, socket);

    // event: 'disconnect'
    disconnectEvent(io, socket);

    // event: 'verify_user' - when user reconnect, we must verify again
    handleVerifyUser(io, socket);

    // scan active users
    scanActiveUsers(io, socket);
});


// 2. Auction Namespace
// 2.1. Middlewares
// export const auctionNamespace = io.of(AUCTION_RESULT_NS);

// auctionNamespace.use((socket: Socket, next) => {
//     let { token, auction_id } = socket.handshake.query;

//     // ! TODO(vuong, khanh): check token
//     if (token && auction_id) {
//         socket.join(auction_id);
//         socket['auctionId'] = auction_id;

//         return next();
//     }
//     else {
//         return next(new Error('Unauthorization or Missing auction id'));
//     }
// });

// // 2.2. Events
// import handleAuctionUserDisconnectEvent from './auctionUserDisconnectEvent';

// auctionNamespace.on('connection', (socket: Socket) => {
//     // console.log('new socket connected to auction id:', socket['auctionId']);

//     handleAuctionUserDisconnectEvent(socket);
// });


export default io;
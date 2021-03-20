import { server } from '../app';
import { Server, Socket } from 'socket.io';
import redisAdapter from 'socket.io-redis';


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
export const MESSENGER_NS = process.env.MESSENGER_NAMESPACE;
export const messengerNamespace = io.of(MESSENGER_NS);

// 1.1. Middlewares
messengerNamespace.use((socket: Socket, next) => {
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
import disconnectEvent from './messengers/disconnectEvent';
import handleNewMessageEvent from './messengers/newMessageEvent';
import handleNewRoomEvent from './messengers/newRoomEvent';
import handleTypingEvent from './messengers/typingEvent';
import handleStopTypingEvent from './messengers/stopTypingEvent';
import handleSeenMessageEvent from './messengers/seenMessageEvent';
import handleVerifyUser from './messengers/verifyUserEvent';
import scanActiveUsers from './messengers/scanActiveUsers';


messengerNamespace.on('connection', (socket: Socket) => {

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
export const AUCTION_RESULT_NS = process.env.AUCTION_RESULT_NAMESPACE;
export const auctionNamespace = io.of(AUCTION_RESULT_NS);

// 2.1. Middlewares
auctionNamespace.use((socket: Socket, next) => {
    let { token, auction_id } = socket.handshake.query;

    // ! TODO(vuong, khanh): check token
    if (token && auction_id) {
        socket.join(auction_id);
        socket['auctionId'] = auction_id;

        return next();
    }
    else {
        return next(new Error('Unauthorization or Missing auction id'));
    }
});

// 2.2. Events
import handleAuctionUserDisconnectEvent from './auctions/auctionUserDisconnectEvent';

auctionNamespace.on('connection', (socket: Socket) => {
    // console.log('new socket connected to auction id:', socket['auctionId']);

    handleAuctionUserDisconnectEvent(socket);
});

// 3. Auction Result List Namespace
export const AUCTION_SET_RESULT_NS = process.env.AUCTIONS_RESULT_NAMESPACE;
export const auctionSetNamespace = io.of(AUCTION_SET_RESULT_NS);

// 3.1. Middlewares
auctionSetNamespace.use((socket: Socket, next) => {
    let { token } = socket.handshake.query;
    let auctionListStr: string = socket.handshake.query.auction_ids;
    let auctionIds: string[] = auctionListStr.split(',');
    
    // ! TODO(vuong, khanh): check token
    if (token && auctionIds?.length > 0) {
        auctionIds.forEach(auction_id => socket.join(auction_id));
        socket['auction_ids'] = auctionIds;
        return next();
    }
    else {
        return next(new Error('Unauthorization or Missing auction id'));
    }
})

// 3.2. Events
import handleAuctionSetUserDisconnectEvent from './auctions/auctionSetUserDisconnectEvent';

auctionSetNamespace.on('connection', (socket: Socket) => {
    handleAuctionSetUserDisconnectEvent(socket);
});


// error
io.on('error', reason => {
    console.log(reason);
});

export default io;
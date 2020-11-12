import { Server, Socket } from "socket.io";

export default (_io: Server, socket: Socket) => {
    socket.on('disconnect', () => {
        let { auction_id } = socket.handshake.query;
        socket.leave(auction_id);
    });
}
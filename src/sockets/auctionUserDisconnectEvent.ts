import { Socket } from "socket.io";

export default (socket: Socket) => {
    socket.on('disconnect', () => {
        let { auction_id } = socket.handshake.query;
        socket.leave(auction_id);
    });
}
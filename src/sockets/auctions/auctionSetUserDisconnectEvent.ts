import { Socket } from "socket.io";

export default (socket: Socket) => {
    socket.on('disconnect', () => {
        console.log('auction set disconnect');
        
        const auction_ids: string[] = socket['auction_ids'];
        auction_ids.forEach(auction_id => socket.leave(auction_id));
    });
}
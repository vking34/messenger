import { Server, Socket } from "socket.io";


export default (_io: Server, socket: Socket) => {
socket.on('disconnect', () => {
     console.log(socket['user_id'], 'disconnected!');
     socket.leave(socket['user_id']);
     
     // socket.broadcast.emit('user left', {
     //     username: socket['user_id']
     // });
 });
}
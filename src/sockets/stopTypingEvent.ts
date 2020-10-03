import { Server, Socket } from "socket.io";

export default (_io: Server, socket: Socket) => {
     socket.on('stop_typing', (data) => {
          // console.log("stop_typing: ", data);
          const { from, to } = data;
  
          socket.to(from).emit('stop_typing', data);
          socket.to(to).emit('stop_typing', data);
      });
}
import { Server, Socket } from "socket.io";

export default (_io: Server, socket: Socket) => {
     socket.on('typing', (data) => {
          // console.log("typing: ", data);
          const { from, to } = data;

          socket.to(from).emit('typing', data);
          socket.to(to).emit('typing', data);
     });
}
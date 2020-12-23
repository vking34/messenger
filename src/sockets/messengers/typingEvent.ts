import { Server, Socket } from "socket.io";

const TYPING_EVENT = 'typing';
export default (_io: Server, socket: Socket) => {
     socket.on(TYPING_EVENT, (data) => {
          const { from, to } = data;

          socket.to(from).emit(TYPING_EVENT, data);
          socket.to(to).emit(TYPING_EVENT, data);
     });
}
import { Server, Socket } from "socket.io";

const STOP_TYPING_EVENT = 'stop_typing';
export default (_io: Server, socket: Socket) => {
     socket.on(STOP_TYPING_EVENT, (data) => {
          const { from, to } = data;

          socket.to(from).emit(STOP_TYPING_EVENT, data);
          socket.to(to).emit(STOP_TYPING_EVENT, data);
     });
}
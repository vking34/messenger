import { Server, Socket } from "socket.io";

export default (_io: Server, socket: Socket) => {

     socket.on('set usernames', (data) => {
          const { from } = data;
          // store the username in the socket session for this client
          socket['user_id'] = from;
          // ++numUsers;
  
          socket.join(from);
  
          // socket.emit('login', {
          //     numUsers: numUsers
          // });
  
          // // echo globally (all clients) that a person has connected
          // socket.broadcast.emit('user joined', {
          //     username: socket['user_id'],
          //     numUsers: numUsers
          // });
      });
}
import { Server, Socket } from "socket.io";

export default (_io: Server, socket: Socket) => {

     socket.on('verify_user', (data) => {
          const { token, user_id, user_role } = data;

          if (token) {
               socket['user_id'] = user_id;
               console.log('user:', socket['user_id'], 'connected.');

               socket.join(user_id);

               // mark user role 
               socket['user_role'] = user_role;

               socket.emit('verify_user', {status: true});
          }
          else {
               socket.emit('verify_user', {status: false});
               socket.disconnect();
          }
     });
}
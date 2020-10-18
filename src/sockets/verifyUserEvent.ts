import { Server, Socket } from "socket.io";

const VERIFY_USER_EVENT = 'verify_user';
export default (_io: Server, socket: Socket) => {
     socket.on(VERIFY_USER_EVENT, (data) => {
          const { token, user_id, user_role } = data;

          if (token) {
               socket['user_id'] = user_id;
               console.log('user:', socket['user_id'], 'connected.');

               socket.join(user_id);

               // mark user role 
               socket['user_role'] = user_role;

               socket.emit(VERIFY_USER_EVENT, {status: true});
          }
          else {
               socket.emit(VERIFY_USER_EVENT, {status: false});
               socket.disconnect();
          }
     });
}
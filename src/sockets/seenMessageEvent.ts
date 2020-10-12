import { Server, Socket } from "socket.io";

// models
import { MessageModel } from '../models/message';
import RoomModel from '../models/room';


export default (_io: Server, socket: Socket) => {

     socket.on('seen_messages', (data) => {
          console.log('seen messages: ', data);
          const { room_id, to, from, last_message_id, last_message_created_at } = data;

          socket.to(to).emit('seen_messages', data);

          // update messages in the message collection
          let condition: any = { room_id, to: from, created_at: { $lte: last_message_created_at }, is_seen: false };
          MessageModel
               .updateMany(condition, { is_seen: true })
               .catch(_e => { });

          // update the last message in the room
          RoomModel.findById(room_id, (_e, room) => {
               if (room['last_message']['_id'] === last_message_id) {
                    room['last_message']['is_seen'] = true;
               }

               from === room['seller'] ?
                    room['seller_unseen_messages'] = 0 :
                    room['buyer_unseen_messages'] = 0;

               room.save();
          });
     });
}
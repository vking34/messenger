import { Server, Socket } from "socket.io";

// models
import { MessageModel } from '../models/message';
import RoomModel from '../models/room';

const SEEN_MESSAGES_EVENT = 'seen_messages';
export default (_io: Server, socket: Socket) => {

     socket.on(SEEN_MESSAGES_EVENT, (data) => {
          const { room_id, to, from, last_message_id, last_message_created_at } = data;

          socket.to(to).emit(SEEN_MESSAGES_EVENT, data);

          // update messages in the message collection
          let condition: any = { room_id, to: from, created_at: { $lte: last_message_created_at }, is_seen: false };
          MessageModel
               .updateMany(condition, { is_seen: true })
               .catch(_e => { });

          // update the last message in the room
          RoomModel.findById(room_id, (_e, room: any) => {
               if (from === room?.seller) {
                    room.seller_unseen_messages = 0;
               }
               else {
                    room.buyer_unseen_messages = 0;
               }
               
               if (room?.buyer_last_message?._id === last_message_id) {
                    room.buyer_last_message.is_seen = true;
               }
               if (room?.seller_last_message?._id === last_message_id) {
                    room.seller_last_message.is_seen = true;
               }

               room.save();
          });
     });
}
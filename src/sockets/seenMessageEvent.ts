import { Server, Socket } from "socket.io";

// models
import { MessageModel } from '../models/message';
import RoomModel from '../models/room';


export default (_io: Server, socket: Socket) => {

     socket.on('seen_messages', (data) => {
          console.log('seen messages: ', data);
          const { room_id, to, from } = data;

          socket.to(to).emit('seen_messages', data);

          // update messages in the message collection
          MessageModel
               .updateMany({ _id: { $in: data.message_ids } }, { is_seen: true })
               .catch(_e => { });

          // update the last message in the room
          RoomModel.findById(room_id, (_e, room) => {
               if (data.message_ids)
                    if (room['last_message']['_id'] === data.message_ids[0]) {
                         room['last_message']['is_seen'] = true;
                         // RoomModel
                         //      .updateOne(
                         //           { _id: room_id },
                         //           { last_message: room.last_message })
                         //      .catch(_e => { });
                    }

               from === room['seller'] ?
                    room['unseen_messages_seller'] = 0 :
                    room['unseen_messages_buyer'] = 0;

               room.save();
          });
          // if (data.message_ids)
          //      if (room.last_message._id === data.message_ids[0]) {
          //           room.last_message.is_seen = true;
          //           // RoomModel
          //           //      .updateOne(
          //           //           { _id: room_id },
          //           //           { last_message: room.last_message })
          //           //      .catch(_e => { });
          //      }

          // from === room.seller ?
          //      room.unseen_messages_seller = 0 :
          //      room.unseen_messages_buyer = 0;

          // room.save();
     });
}
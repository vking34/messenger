import { Server, Socket } from "socket.io";

// models
import { MessageModel } from '../models/message';
import RoomModel from '../models/room';


export default (_io: Server, socket: Socket) => {

     socket.on('seen_messages', async (data) => {
          // console.log('seen messages:', data);
          const { room_id } = data;

          socket.to(data.to).emit('seen_messages', data);

          // update messages in the message collection
          MessageModel
               .updateMany({ _id: { $in: data.message_ids } }, { is_seen: true })
               .catch(_e => { });

          // update the last message in the room
          var room: any = await RoomModel.findById(data.room_id);
          if (room.last_message._id === data.message_ids[0]) {
               room.last_message.is_seen = true;
               RoomModel
                    .updateOne(
                         { _id: room_id },
                         { last_message: room.last_message })
                    .catch(_e => { });
          }
     });
}
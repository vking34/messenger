import { Server, Socket } from "socket.io";
import { MessageFormat } from '../interfaces/message';
import cuid from 'cuid';
import { MESSENGER_NS } from './index';

// models
import { MessageModel } from '../models/message';
import RoomModel from '../models/room';


export default (io: Server, socket: Socket) => {
     socket.on('new_message', (msg: MessageFormat) => {
          // console.log('new_message', msg);
          const { from, to } = msg;
          msg._id = cuid();   // generate message id
          msg.created_at = new Date().toISOString();

          io.of(MESSENGER_NS).in(from).emit('new_message', msg);
          io.of(MESSENGER_NS).in(to).emit('new_message', msg);

          msg.updated_at = msg.created_at;
          MessageModel
               .create({
                    ...msg,
                    is_seen: false
               })
               .then(message => {
                    // RoomModel
                    //      .updateOne({ _id: msg.room_id }, { last_message: message }, (_e, _r) => { });

                    RoomModel.findById(msg.room_id, (_e, room) => {
                         room['last_message'] = message;
                         to === room['seller'] ?
                              room['seller_unseen_messages']++ :
                              room['buyer_unseen_messages']++;

                         room.save();
                    })
               })
               .catch((_e) => { });
     });
}
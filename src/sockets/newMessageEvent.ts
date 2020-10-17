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
                    RoomModel.findById(msg.room_id, (_e, room: any) => {
                         if (to === room.seller) {
                              room.seller_unseen_messages++;
                         }
                         else {
                              room.buyer_unseen_messages++;

                         }
                         room.seller_last_message = message;
                         room.buyer_last_message = message;

                         room.save();
                    })
               })
               .catch((_e) => { });
     });
}
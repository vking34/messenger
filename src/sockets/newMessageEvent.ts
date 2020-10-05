import { Server, Socket } from "socket.io";
import { MessageFormat } from '../requests/message';
import cuid from 'cuid';
import {MESSENGER_NS} from './index';

// models
import { MessageModel } from '../models/message';
import RoomModel from '../models/room';


export default (io: Server, socket: Socket) => {
     socket.on('new_message', (msg: MessageFormat) => {
          console.log('new_message', msg);
          const { from, to } = msg;
          msg._id = cuid();   // generate message id
          
          io.of(MESSENGER_NS).to(from).emit('new_message', msg);
          io.of(MESSENGER_NS).to(to).emit('new_message', msg);

          MessageModel
               .create({
                    ...msg,
                    is_seen: false
               })
               .then(record => {
                    RoomModel
                         .updateOne({ _id: msg.room_id }, { last_message: record }, (_e, _r) => { });
               })
               .catch((_e) => { });
     });
}
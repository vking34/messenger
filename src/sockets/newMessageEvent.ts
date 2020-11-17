import { Server, Socket } from "socket.io";
import { MessageFormat } from '../interfaces/message';
import cuid from 'cuid';
import { MESSENGER_NS } from './index';

// models
import { MessageModel } from '../models/message';
import RoomModel from '../models/room';

const NEW_MESSAGE_EVENT = 'new_message';
export default (io: Server, socket: Socket) => {
    socket.on(NEW_MESSAGE_EVENT, (msg: MessageFormat) => {
        // console.log(NEW_MESSAGE_EVENT, msg);
        const { from, to } = msg;
        msg._id = cuid();   // generate message id
        msg.created_at = new Date().toISOString();

        io.of(MESSENGER_NS).in(from).emit(NEW_MESSAGE_EVENT, msg);
        io.of(MESSENGER_NS).in(to).emit(NEW_MESSAGE_EVENT, msg);

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
                    if (!room?.deleted_by_buyer)
                        room.buyer_last_message = message;
                    if (!room?.deleted_by_seller)
                        room.seller_last_message = message;

                    room.save();
                }).catch(_e => { console.log(_e); });
            })
            .catch((_e) => { console.log(_e) });
    });
}
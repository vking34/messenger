import { Server, Socket } from "socket.io";
import { UserRole } from "../constants/user";
import RoomModel from '../models/room';
import { MESSENGER_NS } from './index';


export default (io: Server, socket: Socket) => {
    socket.on('disconnect', () => {
        let { user_id, user_role } = socket.handshake.query;
        // console.log(user_id, 'disconnected!');
        // console.log('socket id:', socket.id);
        
        socket.leave(user_id);

        io.of(MESSENGER_NS).in(user_id).clients((_e, otherConnections) => {
            console.log(otherConnections, otherConnections.length);
            
            if (otherConnections.length === 0) {
                let condition: any = { enable: { $ne: false } };
                let projection: any;
                let sortOptions: any;
                if (user_role === UserRole.BUYER) {
                    condition.buyer = user_id;
                    projection = { buyer_info: 0, pinned_by_seller: 0, seller_unseen_messages: 0 };
                    sortOptions = { pinned_by_buyer: -1, 'last_message.created_at': -1 };
                }
                else {
                    condition.seller = user_id;
                    projection = { shop: 0, pinned_by_buyer: 0, buyer_unseen_messages: 0 };
                    sortOptions = { pinned_by_seller: -1, 'last_message.created_at': -1 };
                }

                RoomModel.find(condition, projection, (_e, roomRecords) => {
                    if (roomRecords.length > 0) {
                        let target;
                        target = user_role === UserRole.BUYER ? 'seller' : 'buyer';

                        roomRecords.forEach((room) => {
                            const room_id = room._id;
                            io.of(MESSENGER_NS).in(room[target]).clients((_e_, clients) => {
                                if (clients.length > 0) {
                                    io.of(MESSENGER_NS).in(room[target]).emit('change_user_status', {
                                        user_id,
                                        user_role,
                                        room_id,
                                        status: false
                                    })
                                }
                            })
                        })
                    }
                }).sort(sortOptions);
            }
        })
    });
}
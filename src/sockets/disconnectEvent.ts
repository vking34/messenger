import { Server, Socket } from "socket.io";
import { UserRole } from "../constants/user";
import RoomModel from '../models/room';
import { messengerNamespace } from './index';
import { USER_STATUS_CHANGE_EVENT } from './userStatusChangeEvent';

export default (_io: Server, socket: Socket) => {
    socket.on('disconnect', () => {
        let { user_id, user_role } = socket.handshake.query;

        socket.leave(user_id);

        messengerNamespace.in(user_id).clients((_e, otherConnections) => {
            if (otherConnections.length === 0) {
                let condition: any = {};
                let projection: any;
                let sortOptions: any;
                if (user_role === UserRole.BUYER) {
                    condition.buyer = user_id;
                    condition.deleted_by_buyer = { $ne: true };
                    projection = { buyer_info: 0, pinned_by_seller: 0, seller_unseen_messages: 0 };
                    sortOptions = { pinned_by_buyer: -1, 'buyer_last_message.created_at': -1 };
                }
                else {
                    condition.seller = user_id;
                    condition.deleted_by_seller = { $ne: true };
                    projection = { shop: 0, pinned_by_buyer: 0, buyer_unseen_messages: 0 };
                    sortOptions = { pinned_by_seller: -1, 'seller_last_message.created_at': -1 };
                }

                RoomModel.find(condition, projection, (_e, roomRecords) => {
                    if (roomRecords.length > 0) {
                        let target;
                        target = user_role === UserRole.BUYER ? 'seller' : 'buyer';

                        roomRecords.forEach((room) => {
                            const room_id = room._id;
                            messengerNamespace.in(room[target]).clients((_e_, clients) => {
                                if (clients.length > 0) {
                                    messengerNamespace.in(room[target]).emit(USER_STATUS_CHANGE_EVENT, {
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
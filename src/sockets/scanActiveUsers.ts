import { Server, Socket } from "socket.io";
import { UserRole } from "../constants/user";
import RoomModel from '../models/room';
import { MESSENGER_NS } from './index';
import { RoomStatus, StatusRoomList } from '../interfaces/room';
import { USER_STATUS_CHANGE_EVENT } from './userStatusChangeEvent';

const ACTIVE_USER_LIST_EVENT = 'active_user_list';
export default (io: Server, socket: Socket) => {
     let { user_id, user_role } = socket.handshake.query;
     let numOfSenderConnections: number;
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

     // get number of connections belonging to sender
     io.of(MESSENGER_NS).in(user_id).clients((_e, senderConnections) => {
          numOfSenderConnections = senderConnections.length;
     })
     // find all rooms of the sender
     RoomModel.find(condition, projection, (_e, roomRecords) => {
          if (roomRecords) {
               let target;
               let data: StatusRoomList = {
                    user_id,
                    user_role,
                    rooms: []
               };

               target = user_role === UserRole.BUYER ? 'seller' : 'buyer';
               roomRecords.forEach((room, index) => {
                    const room_id = room._id;
                    let roomStatus: RoomStatus = {
                         room_id,
                         status: false
                    }

                    // check if user is online
                    io.of(MESSENGER_NS).in(room[target]).clients((_e, receiverConnections) => {
                         if (receiverConnections.length > 0) {
                              roomStatus.status = true;

                              // send notification that this user is online
                              if (numOfSenderConnections < 2)
                                   io.of(MESSENGER_NS).in(room[target]).emit(USER_STATUS_CHANGE_EVENT, {
                                        user_id,
                                        user_role,
                                        room_id,
                                        status: true
                                   });
                         }

                         data.rooms.push(roomStatus);
                         if (index === roomRecords.length - 1)
                              io.of(MESSENGER_NS).to(user_id).emit(ACTIVE_USER_LIST_EVENT, data);
                    });
               });
          }
     }).sort(sortOptions);
}

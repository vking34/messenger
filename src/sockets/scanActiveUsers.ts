import { Server, Socket } from "socket.io";
import { UserRole } from "../constants/user";
import RoomModel from '../models/room';
import { MESSENGER_NS } from './index';
import { RoomStatus, StatusRoomList } from '../interfaces/room';

export default (io: Server, socket: Socket) => {
     let { user_id, user_role } = socket.handshake.query;
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
          if (roomRecords) {
               let data: StatusRoomList = {
                    user_id,
                    user_role,
                    rooms: []
               };

               if (user_role === UserRole.BUYER) {
                    roomRecords.forEach((room, index) => {
                         const room_id = room._id;
                         let roomStatus: RoomStatus = {
                              room_id,
                              status: false
                         }

                         io.of(MESSENGER_NS).in(room['seller']).clients((_e_, clients) => {
                              if (clients.length > 0) {
                                   roomStatus.status = true;

                                   // send notification that this user is online
                                   io.of(MESSENGER_NS).in(room['seller']).clients((_e_, connections) => {
                                        if (connections.length > 1)
                                             socket.to(room['seller']).emit('change_user_status', {
                                                  user_id,
                                                  user_role,
                                                  room_id,
                                                  status: true
                                             });
                                   });
                              }

                              data.rooms.push(roomStatus);
                              if (index === roomRecords.length - 1)
                                   io.of(MESSENGER_NS).to(user_id).emit('active_user_list', data);
                         });
                    })
               }
               else {
                    roomRecords.forEach((room, index) => {
                         const room_id = room._id;
                         let roomStatus: RoomStatus = {
                              room_id,
                              status: false
                         }

                         io.of(MESSENGER_NS).in(room['buyer']).clients((_e_, clients) => {
                              if (clients.length > 0) {
                                   roomStatus.status = true;

                                   // send notification that this user is online
                                   io.of(MESSENGER_NS).in(room['buyer']).clients((_e_, connections) => {
                                        if (connections.length > 1)
                                             socket.to(room['buyer']).emit('change_user_status', {
                                                  user_id,
                                                  user_role,
                                                  room_id,
                                                  status: true
                                             });
                                   });
                              }

                              data.rooms.push(roomStatus);
                              if (index === roomRecords.length - 1)
                                   io.of(MESSENGER_NS).to(user_id).emit('active_user_list', data);
                         });
                    })
               }
          }
     }).sort(sortOptions);
}

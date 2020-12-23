import { Server, Socket } from "socket.io";
import { SHOP_SERVICE } from '../../routes/room';
import { RoomCreation } from '../../interfaces/room';
import { messengerNamespace } from '../index';
import RoomModel from '../../models/room';
import axios from 'axios';

const CREATE_ROOM_EVENT = 'create_room';
export default (_io: Server, socket: Socket) => {

    socket.on(CREATE_ROOM_EVENT, (room: RoomCreation) => {
        room._id = room.buyer + '.' + room.seller;
        messengerNamespace.to(room.creator).emit(CREATE_ROOM_EVENT, room);

        RoomModel.findById(room._id, (_e, roomRecord: any) => {
            if (!roomRecord) {
                axios.get(SHOP_SERVICE + room.shop_id)
                    .then(response => {
                        room.shop = response.data;

                        // TODO: need to check user_id in shop same to seller_id 
                        RoomModel.create(room).catch(_e => { });
                    })
                    .catch(_e => {
                        room.shop = {};
                    });
            }
            else {
                roomRecord.deleted_by_buyer = false;
                roomRecord.deleted_by_seller = false;
                roomRecord.save();
            }
        });
    });
}
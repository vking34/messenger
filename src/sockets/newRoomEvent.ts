import { Server, Socket } from "socket.io";
import { SHOP_SERVICE } from '../routes/room';
import { RoomCreation } from '../requests/room';
import {MESSENGER_NS} from './index';
import RoomModel from '../models/room';
import axios from 'axios';


export default (io: Server, socket: Socket) => {

     socket.on('create_room', (room: RoomCreation) => {
          // console.log(room);
          room._id = room.buyer + '.' + room.seller;
  
          // test
          socket['user_id'] = room.creator;
          socket.join(room.creator);
          console.log('user:', socket['user_id'], 'connected.');
          //
  
          io.of(MESSENGER_NS).to(room.creator).emit('create_room', room);
  
          RoomModel.findById(room._id, async (_e, record) => {
              if (!record) {
                  await axios.get(SHOP_SERVICE + room.shop_id)
                      .then(response => {
                          room.shop = response.data;
                      })
                      .catch(_e => {
                          room.shop = {};
                      });
  
                  // need to check user_id in shop same to seller_id 
                  RoomModel.create(room).catch(_e => { });
              }
          });
      });
}
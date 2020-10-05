import express, { Response, Request, Router } from 'express';
import { RoomCreation } from '../requests/room';
import RoomModel from '../models/room';
import { UserRole } from '../constants/user';
import axios from 'axios';
// require('dotenv').config();

export const SHOP_SERVICE = process.env.SHOP_SERVICE + '/';
const router: Router = express.Router();


// get chat rooms
router.get('', async (req: Request, resp: Response) => {
     var { user_id, role } = req.query;
     var rooms, condition, projection;
     const sortOptions = { 'last_message.created_at': -1 };

     if (role === UserRole.BUYER) {
          condition = { buyer: user_id };
          projection = { buyer_info: 0 };

          rooms = await RoomModel.find(condition, projection).sort(sortOptions);
     }
     else {
          condition = { seller: user_id };
          projection = { shop: 0 };

          rooms = await RoomModel.find(condition, projection).sort(sortOptions);
     }

     resp.send({
          user_id,
          role,
          rooms
     });
})


// create room
router.post('/', async (req: Request, resp: Response) => {
     // console.log('shop service:', SHOP_SERVICE);
     const room: RoomCreation = req.body;
     room._id = room.buyer + '.' + room.seller;

     RoomModel.findById(room._id, async (_e, record) => {
          if (!record) {
               // need to check user_id in shop same to seller_id 

               resp.send({
                    status: true,
                    message: 'Created room successfully!',
                    room
               });

               let shopResponse = await axios.get(SHOP_SERVICE + room.shop_id);
               room.shop = shopResponse.data;
               RoomModel.create(room).catch(_e => { });
          }
          else
               resp.send({
                    status: false,
                    message: 'The room is existing!'
               });

     })
});


export default router;
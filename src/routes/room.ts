import express, { Response, Request, Router } from 'express';
import { RoomCreation } from '../interfaces/room';
import RoomModel from '../models/room';
import { MessageModel } from '../models/message';
import { UserRole } from '../constants/user';
import axios from 'axios';
import { UserRequest } from '../interfaces/user';


export const SHOP_SERVICE = process.env.SHOP_SERVICE + '/';
const router: Router = express.Router();


// get chat rooms
router.get('', async (req: Request, resp: Response) => {
     let { user_id, role, name, pinned } = req.query;
     let rooms, projection, sortOptions, condition: any = {};

     condition.enable = { $ne: false };
     if (role === UserRole.BUYER) {
          condition.buyer = user_id;
          projection = { buyer_info: 0, pinned_by_seller: 0, seller_unseen_messages: 0, seller_deleted_at: 0 };
          sortOptions = { pinned_by_buyer: -1, 'last_message.created_at': -1 };
          if (name)
               condition['shop.name'] = { $regex: name, $options: 'i' }

          if (pinned) {
               pinned === '1' ?
                    condition.pinned_by_buyer = { $exists: true } :
                    condition.pinned_by_buyer = { $exists: false }
          }
     }
     else {
          condition.seller = user_id;
          projection = { shop: 0, pinned_by_buyer: 0, buyer_unseen_messages: 0, buyer_deleted_at: 0 };
          sortOptions = { pinned_by_seller: -1, 'last_message.created_at': -1 };
          if (name)
               condition['buyer_info.name'] = { $regex: name, $options: 'i' }

          if (pinned) {
               pinned === '1' ?
                    condition.pinned_by_seller = { $exists: true } :
                    condition.pinned_by_seller = { $exists: false }
          }
     }

     rooms = await RoomModel.find(condition, projection).sort(sortOptions);
     resp.send({
          user_id,
          role,
          rooms
     });
});


// create room
router.post('/', async (req: Request, resp: Response) => {
     // console.log('shop service:', SHOP_SERVICE);
     const room: RoomCreation = req.body;
     if (room.buyer === room.seller)
          resp.send({
               status: false,
               message: 'Buyer is the same to seller'
          });

     room._id = room.buyer + '.' + room.seller;

     RoomModel.findById(room._id, async (_e, record) => {
          if (!record) {
               // need to check user_id in shop same to seller_id 
               let shopResponse = await axios.get(SHOP_SERVICE + room.shop_id);
               room.shop = shopResponse.data;
               resp.send({
                    status: true,
                    message: 'Created room successfully!',
                    room
               });

               RoomModel.create(room).catch(_e => { });
          }
          else {
               if (record['enable'] === false) {
                    record['enable'] = true;
                    record.save();
                    resp.send({
                         status: true,
                         message: 'Created room successfully!',
                         room
                    });
               }
               else
                    resp.send({
                         status: false,
                         room_id: room._id,
                         message: 'The room is existing!'
                    });
          }
     })
});


// pin room
router.post('/:room_id/pin', async (req: Request, resp: Response) => {
     const room_id = req.params.room_id;

     let room = await RoomModel.findById(room_id, (_e) => { });
     if (!room) {
          resp.status(400).send({
               status: false,
               message: 'Room not found!'
          });
     }

     const user: UserRequest = req.body;
     let pin;
     let now = Date.now();
     if (user.role === UserRole.BUYER)
          pin = { pinned_by_buyer: now };
     else
          pin = { pinned_by_seller: now };

     RoomModel
          .updateOne({ _id: room_id }, pin)
          .then(_data => resp.send({
               status: true
          }))
          .catch(e => resp.status(400).send({
               status: false,
               message: e
          }));
})


// unpin room
router.delete('/:room_id/pin', async (req: Request, resp: Response) => {
     const room_id = req.params.room_id;
     const user: UserRequest = req.body;

     RoomModel.findById(room_id, (_e, room) => {
          if (!room) {
               resp.status(400).send({
                    status: false,
                    message: 'Room not found!'
               });
          }

          if (user.role === UserRole.BUYER)
               room['pinned_by_buyer'] = undefined;
          else
               room['pinned_by_seller'] = undefined;

          room.save();
          resp.send({
               status: true,
               room
          })
     })
})

// mark as seen room
router.put('/:room_id/seen', (req: Request, resp: Response) => {
     const room_id = req.params.room_id;
     const user: UserRequest = req.body;

     RoomModel.findById(room_id, (_e, room: any) => {
          if (!room) {
               resp.status(400).send({
                    status: false,
                    message: 'Room not found!'
               });
          }

          if (room['last_message']['from'] === user.user_id)
               resp.status(400).send({
                    status: false,
                    message: 'The last message is yours!'
               });

          if (room['last_message']['is_seen'])
               resp.send({
                    status: true,
                    message: 'The last message is seen!'
               });

          room['last_message']['is_seen'] = true;
          if (user.role === UserRole.BUYER)
               room.buyer_unseen_messages = 0;
          else
               room.seller_unseen_messages = 0;

          room.save({}, () => {
               let findCondition: any = { room_id, to: user.user_id, created_at: { $lte: Date.now() }, is_seen: false };
               MessageModel
                    .updateMany(findCondition, { is_seen: true })
                    .catch(_e => { });
          });

          resp.send({
               status: true,
               room
          });
     })
});

// delete room
router.delete('/:room_id', (req: Request, resp: Response) => {
     const room_id = req.params.room_id;
     const { role } = req.query;

     RoomModel.findById(room_id, (_e, room: any) => {
          if (!room)
               resp.send({
                    status: false,
                    message: 'Room not found!'
               });
          else {
               let now = new Date();

               room.enable = false;
               role === UserRole.BUYER ?
                    room.buyer_deleted_at = now :
                    room.seller_deleted_at = now;
               room.save();

               resp.send({
                    status: true,
                    deleted_at: now
               });
          }
     });
})

// get room
router.get('/:room_id', async (req: Request, resp: Response) => {
     const room_id = req.params.room_id;

     let result = await RoomModel.find({ _id: room_id });
     let room = result ? result[0] : {};

     resp.send({
          room
     });
})


export default router;
import express, { Response, Request, Router } from "express";
import { RoomCreation } from "../interfaces/room";
import RoomModel from "../models/room";
import { MessageModel } from "../models/message";
import { UserRole } from "../constants/user";
import axios from "axios";
import { UserRequest } from "../interfaces/user";
import emitUserStatusChangeEvent from "../sockets/userStatusChangeEvent";
import { ROOM_NOT_FOUND, MISSING_ROLE } from '../constants/response';

export const SHOP_SERVICE = process.env.SHOP_SERVICE + "/";
const router: Router = express.Router();

// get chat rooms
router.get("", async (req: Request, resp: Response) => {
     let { user_id, role, name, pinned } = req.query;
     let rooms,
          projection,
          sortOptions,
          condition: any = {};

     // condition.enable = { $ne: false };
     if (role === UserRole.BUYER) {
          condition.buyer = user_id;
          condition.deleted_by_buyer = { $ne: true };
          projection = {
               buyer_info: 0,
               pinned_by_seller: 0,
               seller_unseen_messages: 0,
               seller_deleted_at: 0,
               deleted_by_buyer: 0,
               deleted_by_seller: 0,
               seller_last_message: 0
          };
          sortOptions = { pinned_by_buyer: -1, "buyer_last_message.created_at": -1 };
          if (name) condition["shop.name"] = { $regex: name, $options: "i" };

          if (pinned) {
               pinned === "1"
                    ? (condition.pinned_by_buyer = { $exists: true })
                    : (condition.pinned_by_buyer = { $exists: false });
          }
     } else {
          condition.seller = user_id;
          condition.deleted_by_seller = { $ne: true };
          projection = {
               shop: 0,
               pinned_by_buyer: 0,
               buyer_unseen_messages: 0,
               buyer_deleted_at: 0,
               deleted_by_buyer: 0,
               deleted_by_seller: 0,
               buyer_last_message: 0
          };
          sortOptions = {
               pinned_by_seller: -1,
               "seller_last_message.created_at": -1,
          };
          if (name) condition["buyer_info.name"] = { $regex: name, $options: "i" };

          if (pinned) {
               pinned === "1"
                    ? (condition.pinned_by_seller = { $exists: true })
                    : (condition.pinned_by_seller = { $exists: false });
          }
     }

     rooms = await RoomModel.find(condition, projection).sort(sortOptions);
     resp.send({
          user_id,
          role,
          rooms,
     });
});

// create room
router.post("/", async (req: Request, resp: Response) => {
     // console.log('shop service:', SHOP_SERVICE);
     const roomRequest: RoomCreation = req.body;
     if (roomRequest.buyer === roomRequest.seller)
          resp.send({
               status: false,
               message: "Buyer is the same to seller",
          });
     else {
          roomRequest._id = roomRequest.buyer + "." + roomRequest.seller;
          RoomModel.findById(roomRequest._id, async (_e, room: any) => {
               if (!room) {
                    // need to check user_id in shop same to seller_id
                    let shopResponse = await axios.get(SHOP_SERVICE + roomRequest.shop_id);
                    roomRequest.shop = shopResponse.data;
                    resp.send({
                         status: true,
                         message: "Created room successfully!",
                         room: roomRequest,
                    });

                    RoomModel.create(roomRequest).catch((_e) => { });
               }
               else {
                    if (roomRequest.creator === roomRequest.buyer && !room.deleted_by_buyer)
                         resp.send({
                              status: false,
                              message: 'Room exsits!',
                              room
                         });
                    else if (roomRequest.creator === roomRequest.seller && !room.deleted_by_seller)
                         resp.send({
                              status: false,
                              message: 'Room exsits!',
                              room
                         });
                    else {
                         room.deleted_by_buyer = false;
                         room.deleted_by_seller = false;
                         room.save();
                         resp.send({
                              status: true,
                              message: "Room exists and re-enable room for seller and buyer",
                              room,
                         });
                    }
               }
          });
     }
});

// re-enable room
router.put('/:room_id/enable', (req: Request, resp: Response) => {
     const room_id: string = req.params.room_id;
     const { role } = req.body;

     if (!role) {
          resp.status(400).send(MISSING_ROLE);
     }
     else {
          RoomModel.findById(room_id, (_e, room: any) => {
               if (!room) {
                    resp.status(400).send(ROOM_NOT_FOUND);
               }
               else {
                    if (role === UserRole.BUYER)
                         room.deleted_by_buyer = false;
                    else
                         room.deleted_by_seller = false;

                    room.save();
                    resp.send({
                         status: true,
                         message: 'Enable room successfully!',
                         room
                    });
               }
          });
     }
})

// pin room
router.post("/:room_id/pin", async (req: Request, resp: Response) => {
     const room_id = req.params.room_id;

     let room = await RoomModel.findById(room_id, (_e) => { });
     if (!room) {
          resp.status(400).send(ROOM_NOT_FOUND);
     }
     else {
          const user: UserRequest = req.body;
          let pin;
          let now = Date.now();
          if (user.role === UserRole.BUYER) pin = { pinned_by_buyer: now };
          else pin = { pinned_by_seller: now };

          RoomModel.updateOne({ _id: room_id }, pin)
               .then((_data) =>
                    resp.send({
                         status: true,
                    })
               )
               .catch((e) =>
                    resp.status(400).send({
                         status: false,
                         message: e,
                    })
               );
     }
});

// unpin room
router.delete("/:room_id/pin", async (req: Request, resp: Response) => {
     const room_id = req.params.room_id;
     const user: UserRequest = req.body;

     RoomModel.findById(room_id, (_e, room) => {
          if (!room) {
               resp.status(400).send(ROOM_NOT_FOUND);
          }
          else {
               if (user.role === UserRole.BUYER) room["pinned_by_buyer"] = undefined;
               else room["pinned_by_seller"] = undefined;

               room.save();
               resp.send({
                    status: true,
                    room,
               });
          }
     });
});

// mark room as seen
router.put("/:room_id/seen", (req: Request, resp: Response) => {
     const room_id = req.params.room_id;
     const user: UserRequest = req.body;

     RoomModel.findById(room_id, (_e, room: any) => {
          if (!room) {
               resp.status(400).send(ROOM_NOT_FOUND);
          }

          if (room?.buyer_last_message.from === user.user_id) {
               resp.send({
                    status: true,
                    room,
               });
          }

          if (user.role === UserRole.BUYER) {
               room.buyer_unseen_messages = 0;

               if (room?.buyer_last_message.is_seen) {
                    resp.send({
                         status: true,
                         room,
                    });
               } else if (room.buyer_last_message.is_seen) {
                    room.buyer_last_message.is_seen = true;
               }
          } else {
               room.seller_unseen_messages = 0;

               if (room?.seller_last_message.is_seen) {
                    resp.send({
                         status: true,
                         room,
                    });
               } else if (room.seller_last_message.is_seen) {
                    room.seller_last_message.is_seen = true;
               }
          }

          room.save();
          let findCondition: any = {
               room_id,
               to: user.user_id,
               created_at: { $lte: Date.now() },
               is_seen: false,
          };
          MessageModel.updateMany(findCondition, { is_seen: true }).catch((_e) => { });

          resp.send({
               status: true,
               room,
          });
     });
});

// delete room
router.delete("/:room_id", (req: Request, resp: Response) => {
     const room_id = req.params.room_id;
     const { role } = req.query;

     RoomModel.findById(room_id, (_e, room: any) => {
          if (!room)
               resp.send(ROOM_NOT_FOUND);
          else {
               let now = new Date();

               // room.enable = false;
               if (role === UserRole.BUYER) {
                    room.deleted_by_buyer = true;
                    room.buyer_deleted_at = now;
                    room.buyer_last_message = undefined;
                    room.pinned_by_buyer = undefined;
                    room.buyer_unseen_messages = 0;
                    emitUserStatusChangeEvent(room.buyer, room.seller, UserRole.BUYER, room._id, false);
               } else {
                    room.deleted_by_seller = true;
                    room.seller_deleted_at = now;
                    room.seller_last_message = undefined;
                    room.pinned_by_seller = undefined;
                    room.seller_unseen_messages = 0;
                    emitUserStatusChangeEvent(room.seller, room.buyer, UserRole.SELLER, room._id, false);
               }

               room.save();
               resp.send({
                    status: true,
                    role,
                    deleted_at: now,
               });
          }
     });
});

// block user
router.post('/:room_id/block', async (req: Request, resp: Response) => {
     const room_id: string = req.params.room_id;
     const { block } = req.body;

     RoomModel.findById(room_id, (_e, room: any) => {
          if (!room) {
               resp.status(400).send(ROOM_NOT_FOUND);
               return;
          }

          // if (block === 'undefined' || role === 'undefined') {
          //      resp.status(400).send({
          //           status: false,
          //           message: 'Role/Block is missing!'
          //      });
          // }

          if (block) {
               room.blocked_at = Date.now();
          }
          else {
               delete room.blocked_at;
          }
          room.save();

          resp.send({
               status: true,
               room
          })
     })
});

// get room
router.get("/:room_id", async (req: Request, resp: Response) => {
     const room_id = req.params.room_id;

     let result = await RoomModel.find({ _id: room_id });
     let room = result ? result[0] : {};

     resp.send({
          room,
     });
});

export default router;

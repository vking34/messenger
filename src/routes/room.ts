import express, { Response, Request, Router } from 'express';
import { RoomCreation } from '../requests/room';
import RoomModel from '../models/room';


const router: Router = express.Router();

// get chat rooms
router.get('', (req: Request, resp: Response) => {
     var { user_id, role } = req.query;

     console.log(user_id, role);

     if (role === 'BUYER')
          RoomModel.find(
               {
                    buyer: user_id
               },
               (_e, rooms) => {
                    resp.send({
                         user_id,
                         role,
                         rooms
                    });
               })
               .catch((e) => {
                    const rooms = [];
                    resp.send({
                         user_id,
                         role,
                         rooms,
                         message: e
                    });
               });

     else
          RoomModel.find(
               {
                    seller: user_id
               },
               (_e, rooms) => {
                    resp.send({
                         user_id,
                         role,
                         rooms
                    });
               })
               .catch((e) => {
                    const rooms = [];
                    resp.send({
                         user_id,
                         role,
                         rooms,
                         message: e
                    });
               });
})



// create room
router.post('/', (req: Request, resp: Response) => {
     const room: RoomCreation = req.body;
     var roomId = room.buyer + '.' + room.seller;

     RoomModel.create({
          _id: roomId,
          ...room
     })
          .then(room => {
               console.log(room);
               resp.send(room);
          })
          .catch(e => {
               resp.send(e).status(500);
          })
});


export default router;
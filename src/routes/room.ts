import express, { Response, Request, Router } from 'express';
import { RoomCreation } from '../requests/room';
import RoomModel from '../models/room';
import { UserRole } from '../constants/user';


const router: Router = express.Router();

// get chat rooms
router.get('', async (req: Request, resp: Response) => {
     var { user_id, role } = req.query;
     var rooms;
     const sortOptions = {'last_message.created_at': -1};

     if (role === UserRole.BUYER)
          rooms = await RoomModel.find({ buyer: user_id }).sort(sortOptions);
     else
          rooms = await RoomModel.find({ seller: user_id }).sort(sortOptions);

     resp.send({
          user_id,
          role,
          rooms
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
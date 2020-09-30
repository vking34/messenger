import express, { Response, Request, Router } from 'express';
import { RoomCreation } from '../requests/room';
import Room from '../models/room';

const router: Router = express.Router();

// get chat rooms
router.get('/', (req: Request, resp: Response) => {
     console.log(req);
     resp.send('rooms');
})


// create room
router.post('/', (req: Request, resp: Response) => {
     const room: RoomCreation = req.body;
     var roomId = room.buyer + '.' + room.seller;

     Room.create({
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
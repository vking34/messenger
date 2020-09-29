import express, {Request, Response, Router } from 'express';
import Message from '../models/message';
import cuid from 'cuid';


const router: Router = express.Router();

// get messages
router.get('/', (_req: Request, resp: Response) => {
     resp.send('users');
})

// create message
router.post('/', (req: Request, resp: Response) => {
     console.log('save message... ');
     const msg = req.body;
     
     if(msg.sender.localeCompare(msg.receiver) > 0)
          var roomId: string = msg.receiver as string + '.' + msg.sender as string;
     else
          var roomId: string = msg.sender as string + '.' + msg.receiver as string; 

     Message.create({
          _id: cuid(),
          ...msg,
          room_id: roomId,
          type: 'SSB',
          is_seen: false
     })
     .then((msg) => {
          console.log(msg);
          resp.send(msg);
     })
     .catch((error: any) => {
          resp.send(error).status(500);
     })
});

// update message
router.put('/:id', (req: Request, resp: Response) => {
     const messageId = req.params.id;
     const content = req.body;

     Message
     .findByIdAndUpdate({_id: messageId}, content)
     .then((msg) => {
          resp.send({...msg, ...content});
     })
     .catch((error: any) => {
          resp.send(error).status(500);
     });
})


export default router;
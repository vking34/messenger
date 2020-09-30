import express, { Request, Response, Router } from 'express';
import { MessageModel } from '../models/message';
import cuid from 'cuid';

const router: Router = express.Router();

// Get messages
router.get('/', async (req: Request, resp: Response) => {
     const params = req.query;
     var { room_id, created_at, limit, from } = params;
     var recordLimit = limit ? Number(limit) : 15;

     var findCondition: any = { room_id };
     if (from) {
          findCondition.created_at = { $lt: from.toString() }
     }

     const data = await MessageModel
          .find(findCondition)
          .sort({
               created_at: created_at === '1' ? 1 : -1
          })
          .limit(recordLimit);

     resp.send({
          room_id: room_id,
          filters: {
               message_count: data.length,
               from: from ? from : new Date()
          },
          data
     });
})

// Create message
router.post('/', (req: Request, resp: Response) => {
     console.log('save message... ');
     const msg = req.body;

     if (msg.sender.localeCompare(msg.receiver) > 0)
          var roomId: string = msg.receiver as string + '.' + msg.sender as string;
     else
          var roomId: string = msg.sender as string + '.' + msg.receiver as string;

     MessageModel
          .create({
               _id: cuid(),
               ...msg,
               room_id: roomId,
               type: 'SB',
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

     MessageModel
          .findByIdAndUpdate({ _id: messageId }, content)
          .then((msg) => {
               resp.send({ ...msg, ...content });
          })
          .catch((error: any) => {
               resp.send(error).status(500);
          });
})


export default router;
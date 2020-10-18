import express, { Request, Response, Router } from 'express';
import { MessageModel } from '../models/message';
import cuid from 'cuid';

const router: Router = express.Router();

// Get messages
router.get('/', async (req: Request, resp: Response) => {
     const params = req.query;
     let { room_id, created_at, limit, from, to } = params;
     let recordLimit = limit ? Number(limit) : 15;
     let sortOpt = { created_at: created_at === '1' ? 1 : -1 };
     let condition: any = { room_id };

     if (from && to)
          condition.created_at = { $lt: from, $gt: to }
     else if (from)
          condition.created_at = { $lt: from }
     else if (to)
          condition.created_at = { $gt: to }

     const data = await MessageModel
          .find(condition)
          .limit(recordLimit)
          .sort(sortOpt);

     resp.send({
          room_id: room_id,
          filters: {
               message_count: data.length,
               from: from ? from : new Date()
          },
          data
     });
});

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


// Get unseen messages
router.get('/unseen', async (req: Request, resp: Response) => {
     const { room_id, from, user_id } = req.query;
     // let sortOpt = { created_at: created_at === '1' ? 1 : -1 };
     let condition: any = { room_id, to: user_id, is_seen: false };
     if (from) {
          condition.created_at = { $lte: from }
     }

     const data = await MessageModel
          .find(condition);

     resp.send({
          room_id: room_id,
          filters: {
               message_count: data.length,
               from: from ? from : new Date()
          },
          data
     });
});


// test mark many message as seen
// TODO: clear this in production
// router.post('/unseen', (req: Request, resp: Response) => {
//      const { room_id, from, user_id } = req.body;
//      let condition: any = { room_id, to: user_id, is_seen: false };
//      if (from)
//           condition.created_at = { $lte: from }


//      MessageModel.updateMany(condition, { is_seen: true }).catch(_e => { });

//      resp.send({
//           status: true
//      });
// })

export default router;
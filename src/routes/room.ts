import express, { Response, Request, Router } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
     console.log(req);
     res.send('rooms');
})


export default router;
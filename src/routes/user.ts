import express, {Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/', (_req: Request, res: Response) => {
     res.send('users');
})


export default router;
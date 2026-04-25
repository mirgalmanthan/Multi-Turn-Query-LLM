import { Router } from 'express';
import { verifyAuthToken } from '../middlewares/verify';
import { query } from '../controllers/queryController';

const queryRouter = Router();


queryRouter.post('/', verifyAuthToken, query);

export default queryRouter;

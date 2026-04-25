import { Router } from 'express';
import { demoToken } from '../controllers/authController';

const authRouter = Router();


authRouter.post('/demo', demoToken);

export default authRouter;

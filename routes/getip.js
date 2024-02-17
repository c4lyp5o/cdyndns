import { Router } from 'hyper-express';
import { getPublicIp } from '../controllers/ipChecker.js';

const router = new Router();

router.route('/').get(getPublicIp);

export default router;

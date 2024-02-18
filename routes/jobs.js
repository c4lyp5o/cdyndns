import { Router } from 'hyper-express';
import {
  getAllJobs,
  startAllJobs,
  stopOneJob,
  stopAllJobs,
} from '../controllers/schedulerMx.js';

const router = new Router();

router.route('/getall').get(async (req, res) => {
  const response = await getAllJobs();
  res.json(response);
});

router.route('/startall').get(async (req, res) => {
  const response = await startAllJobs();
  res.json(response);
});

router.route('/stopall').get(async (req, res) => {
  const response = await stopAllJobs();
  console.log(response);
  res.json(response);
});

router.route('/stop/:serviceName').get(async (req, res) => {
  const { serviceName } = req.params;
  const response = await stopOneJob(serviceName);
  res.json(response);
});

export default router;

import { Router } from 'hyper-express';
import {
  createServiceSettings,
  readServiceSettings,
  updateServiceSettings,
  deleteDomainFromService,
  deleteServiceAndDomains,
  killItWithFire,
} from '../controllers/settingsMx.js';

const router = new Router();

router.route('/').post(createServiceSettings);
router.route('/').get(readServiceSettings);
router.route('/').put(updateServiceSettings);
router.route('/:serviceId/:domainId').delete(deleteDomainFromService);
router.route('/:serviceId').delete(deleteServiceAndDomains);
router.route('/killitwithfire').delete(killItWithFire);

export default router;

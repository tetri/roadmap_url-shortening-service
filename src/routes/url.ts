import { Router } from 'express';
import * as urlController from '../controllers/url';
import { validateCreateUrl, validateUpdateUrl } from '../middlewares/validation';

const router = Router();

router.post('/shorten', validateCreateUrl, urlController.createShortUrl);
router.get('/shorten/:shortCode', urlController.getOriginalUrl);
router.put('/shorten/:shortCode', validateUpdateUrl, urlController.updateShortUrl);
router.delete('/shorten/:shortCode', urlController.deleteShortUrl);
router.get('/shorten/:shortCode/stats', urlController.getUrlStats);

export default router;

import { Router } from 'express';
import { asyncHandler, formatResponse } from '../../utils/response';
import { protect } from '../../middleware/authMiddleware';
import SosEvent from '../admin/sos.model';

const router = Router();

router.use(protect);

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { rideId, requestId, location } = req.body;
  
  const sosEvent = await SosEvent.create({
    user: req.user.id,
    ride: rideId,
    request: requestId,
    location,
    status: 'active',
  });

  // TODO: Trigger push notifications to emergency contacts & Admin socket alerts
  
  return formatResponse(res, 201, 'SOS triggered', sosEvent);
}));

import { Request, Response } from 'express';

export default router;

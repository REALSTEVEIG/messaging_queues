import { Router } from 'express';
import { greetingsController, exampleController } from '../controllers/controller';

const router: Router = Router();

router.get('/example', exampleController);

router.get('/greetings', greetingsController);

export default router;



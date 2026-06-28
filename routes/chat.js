import {Router} from 'express';

import controller from '../controllers/chat.js';

const router = new Router();

router.post(
  '/send/message',
  controller.sendMessage,
);

router.post(
  '/users/list',
  controller.getUsersList,
);

router.post(
  '/messages/:fromId',
  controller.getMessages,
);

export default router;
import {Router} from 'express';

import usersRouter from './users.js';
import apiChatRouter from './chat.js';

const router = new Router();

router.use('/users', usersRouter);
router.use('/api/chat', apiChatRouter);

router.get('/chat', (req, res) => {
  res.render('chat');
});

export default router;
import {Router} from 'express';

import controller from '../controllers/users.js';

const router = new Router();

router.post(
  '/register',
  controller.register,
);

router.post(
  '/login',
  controller.login,
);

router.post(
  '/activate',
  controller.activate,
);

router.get(
  '/profile',
  controller.profile,
);

router.post(
  '/logout',
  controller.logout,
);

router.get(
  '/reset',
  controller.resetSend,
);

router.post(
  '/check',
  controller.checkCodefromPassword,
);

router.post(
  '/reset-password',
  controller.resetPassword,
);

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/activateEmail', (req, res) => {
  res.render('activateEmail');
});

export default router;
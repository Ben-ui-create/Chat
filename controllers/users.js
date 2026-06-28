import HttpErrors from 'http-errors'
import {Users} from '../models/index.js';
import _ from 'lodash';

import sendEmail from '../services/email.js';

function generate() {
  return Math.ceil(100000 + Math.random() * 900000);
}

export default {
  async register(req, res, next) {
    try {
      const {name, email, password} = req.body;

      const existingEmail = await Users.findOne({
        where: {
          email: email,
        },
      });

      if (!_.isEmpty(existingEmail)) {
        throw new HttpErrors(402, {
          errors: {
            email: 'Email already in use.',
          },
        });
      }

      const activationToken = generate();

      const user = await Users.create({
        name,
        email,
        password,
        activationToken,
      });

      await sendEmail({
        to: email,
        subject: 'Please activate your email address',
        template: 'register',
        data: {
          code: activationToken,
        }
      });

      const userData = user.toJSON();

      delete userData.activationToken;
      delete userData.password;

      res.status(200).json({
        message: 'User successfully registered, please activate your email address',
        userData,
      });
    } catch (e) {
      next(e);
    }
  },

  async activate(req, res, next) {
    try {
      const {activationToken} = req.body;

      const user = await Users.findOne({
        where: {
          activationToken,
        }
      });

      if (!activationToken) {
        throw new HttpErrors(422, {
          errors: {
            message: 'Wrong activation token',
          },
        });
      } else {
        await user.update({
          status: 'active',
          activationToken: null,
        });
      }

      res.status(200).json({
        message: 'Your email address successfully activated!',
      });
    } catch (e) {
      next(e);
    }
  },

  async login(req, res, next) {
    try {
      const {email, password} = req.body;

      const user = await Users.findOne({
        where: {
          email: email,
        },
      });

      if (!user || user.password !== Users.hashPassword(password)) {
        throw new HttpErrors(422, {
          errors: {
            message: 'Invalid email or password',
          },
        });
      }

      if (user.status !== 'active') {
        throw new HttpErrors(401, {
          errors: {
            message: 'Please activate your email address',
          },
        });
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.name,
      }

      const userData = user.toJSON();

      delete userData.password;
      delete userData.activationToken;

      res.status(200).json({
        message: 'Logged in',
        userData,
      });
    } catch (e) {
      next(e);
    }
  },

  async profile(req, res, next) {
    try {
      if (!req.session.user) {
        throw new HttpErrors(401, {
          errors: {
            message: 'Unauthorized',
          },
        });
      }

      const user = await Users.findByPk(req.session.user.id);

      if (!user) {
        throw new HttpErrors(404, {
          errors: {
            message: 'Users not found',
          },
        });
      }

      const userData = user.toJSON();

      delete userData.password;
      delete userData.activationToken;

      res.status(200).json({
        message: 'Profile',
        userData,
      });
    } catch (e) {
      next(e);
    }
  },

  async logout(req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) {
          next(err);
          return;
        }

        res.clearCookie('cookie.sid');

        res.status(200).json({
          message: 'Logged out',
        });
      });

    } catch (e) {
      next(e);
    }
  },

  async resetSend(req, res, next) {
    try {
      if (!req.session.user) {
        throw new HttpErrors(401, {
          errors: {
            message: 'Unauthorized',
          },
        });
      }

      const user = await Users.findByPk(req.session.user.id);

      const resetPasswordToken = generate();

      await user.update({
        resetPasswordToken: resetPasswordToken,
      });

      await sendEmail({
        to: user.email,
        subject: 'Your six-digit code reset password',
        template: 'resetPassword',
        data: {
          code: resetPasswordToken,
        },
      });

      res.status(200).json({
        message: 'Check your email',
      });
    } catch (e) {
      next(e);
    }
  },

  async checkCodefromPassword(req, res, next) {
    try {
      const {resetPasswordToken} = req.body;

      const user = await Users.findOne({
        where: {
          resetPasswordToken,
        },
      });

      if (!user) {
        throw new HttpErrors(422, {
          errors: {
            message: 'Invalid code',
          },
        });
      } else {
        await user.update({
          resetPasswordToken: null,
        });
      }

      res.status(200).json({
        message: 'Very successfully you can reset password',
      });
    } catch (e) {
      next(e);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const {oldPassword, newPassword} = req.body;

      const user = await Users.findByPk(req.session.user.id);

      if (user.resetPasswordToken !== null) {
        throw new HttpErrors(422, {
          errors: {
            message: 'Enter the code from the sms to change your password',
          }
        });
      }

      console.log(oldPassword);
      console.log(user.password);

      if (Users.hashPassword(oldPassword) !== user.password) {
        throw new HttpErrors(422, {
          errors: {
            message: 'Invalid password',
          },
        });
      }

      await user.update({
        password: newPassword,
      });

      res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (e) {
      next(e);
    }
  }
}
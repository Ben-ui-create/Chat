import session from 'express-session';
import sessionStore from './sessionStore.js';
import moment from 'moment';

const {SESSION_SECRET} = process.env;

const twoWeeksInMs = moment().add(2, 'weeks').diff(moment());

const sessionMiddleware = session({
  secret: SESSION_SECRET,

  store: sessionStore,

  resave: false,

  saveUninitialized: false,

  cookie: {
    maxAge: twoWeeksInMs,
    httpOnly: true,
    secure: false,
  }
});

export default sessionMiddleware;
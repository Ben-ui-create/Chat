import 'dotenv/config';
import morgan from 'morgan';
import {createServer} from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import {fileURLToPath} from 'url';
import path from 'path';
import Socket from './services/Socket.js';

import './migrate.js';

import errorHandler from './middlewares/errorHandler.js';
import sessionMiddleware from './config/session.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

import routes from './routes/index.js';

const app = express();

const {PORT, COOKIE_SECRET} = process.env;

app.set('views', path.resolve('views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.json());
app.use(sessionMiddleware);
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(COOKIE_SECRET));

app.use(routes);

app.use(errorHandler.notFound);
app.use(errorHandler.errors);

const server = createServer(app);

Socket.init(server)
  .catch((err) => {
    console.log(err)
  });

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

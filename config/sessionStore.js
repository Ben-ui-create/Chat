import session from 'express-session';
import MySqlStoreFactory from 'express-mysql-session';

const MySqlStore = MySqlStoreFactory(session);

const {
  MY_SQL_HOST,
  MY_SQL_PORT,
  MY_SQL_USER,
  MY_SQL_PASSWORD,
  MY_SQL_DATABASE,
} = process.env;

const options = {
  host: MY_SQL_HOST,
  port: Number(MY_SQL_PORT),
  user: MY_SQL_USER,
  password: MY_SQL_PASSWORD,
  database: MY_SQL_DATABASE,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnsNames: {
      sessionId: 'session_id',
      expires: 'expires',
      data: 'data',
    }
  }
};

const sessionStore = new MySqlStore(options);

export default sessionStore;
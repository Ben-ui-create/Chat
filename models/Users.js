import {DataTypes, Model} from 'sequelize';
import md5 from 'md5';

import db from '../clients/db.sequelize.js';

const {PASSWORD_SECRET} = process.env;

class Users extends Model {
  static hashPassword(password) {
    return md5(md5(password) + PASSWORD_SECRET);
  }
}

Users.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('password', Users.hashPassword(value));
      }
    }
  },
  {
    sequelize: db.sequelize,
    modelName: 'users',
    tableName: 'users',
    timestamps: true,
  },
);

export default Users;
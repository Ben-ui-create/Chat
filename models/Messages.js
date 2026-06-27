import {DataTypes, Model} from 'sequelize';

import Users from './Users.js';

import db from '../clients/db.sequelize.js';

class Messages extends Model {

}

Messages.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    message: {
      type: DataTypes.STRING,
    },

    from: {
      type: DataTypes.BIGINT,
    },

    to: {
      type: DataTypes.BIGINT,
    }
  },
  {
    sequelize: db,
    modelName: 'messages',
    tableName: 'messages',
    timestamps: true,
  }
);

Users.hasMany(Messages, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Messages.belongsTo(Users, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

export default Messages;
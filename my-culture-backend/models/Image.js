import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Image', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      validate: {
        isInt: { msg: 'The locationId field must be a valid integer.' },
        notNull: { msg: 'The locationId field is required.' },
      },
    },
  });
};
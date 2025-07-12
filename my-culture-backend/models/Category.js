import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Category', {
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 40],
          msg: 'Value must be between 3 and 40 characters.',
        },
      },
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 40],
          msg: 'Label must be between 3 and 40 characters.',
        },
      },
    },
  });
}
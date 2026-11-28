import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Newsletter', {
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'The subject field cannot be empty.' },
        len: { args: [1, 255], msg: 'The subject must be between 1 and 255 characters.' },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'The content field cannot be empty.' },
      }
    },
  })
};
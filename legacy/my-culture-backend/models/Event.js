import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Event', {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'The title field cannot be empty.' },
        len: { args: [1, 255], msg: 'The title must be between 1 and 255 characters.' },
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'The date must be a valid date.' },
        notNull: { msg: 'The date field is required.' },
      },
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'The content field cannot be empty.' },
      }
    },
    conclusion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: { args: [0, 5000], msg: 'The conclusion must not exceed 5000 characters.' },
      },
    },
    discountedPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: { msg: 'The discountedPrice field must be a valid float.' },
        min: { args: [0], msg: 'The discountedPrice must be a positive number.' },
      },
    },
    abendkassePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: { msg: 'The abendkassePrice field must be a valid float.' },
        min: { args: [0], msg: 'The abendkassePrice must be a positive number.' },
      },
    },
    prebookedPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: { msg: 'The prebookedPrice field must be a valid float.' },
        min: { args: [0], msg: 'The prebookedPrice must be a positive number.' },
      },
    },
    bookingLink: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: { msg: 'The bookingLink must be a valid URL.' },
      },
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: 'The published field must be true or false.',
        },
      },
    },
  }, {
    indexes: [
      { fields: ['date'] },
      { fields: ['published'] },
      { fields: ['published', 'date'] },
      { fields: ['userId'] },
      { fields: ['locationId'] },
      { fields: ['imageId'] },
      { fields: ['createdAt'] }
    ]
  });
};
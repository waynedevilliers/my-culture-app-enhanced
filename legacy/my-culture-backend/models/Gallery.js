import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Gallery", {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: "The title must be between 1 and 255 characters.",
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "The content field cannot be empty." },
      },
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "The published field must be true or false.",
        },
      },
    },
  }, {
    indexes: [
      { fields: ['published'] },
      { fields: ['createdAt'] },
      { fields: ['published', 'createdAt'] },
      { fields: ['title'] }
    ]
  });
};

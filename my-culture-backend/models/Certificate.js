import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Certificate", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: "Title must be between 3 and 255 characters.",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [3, 5000],
          msg: "Description must be between 3 and 5000 characters.",
        },
      },
    },
    issuedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Issued Date must be a valid date.",
        },
      },
    },
    issuedFrom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: "Issued From must be between 3 and 255 characters.",
        },
      },
    },
    certificateUrl: {
      type: DataTypes.STRING,
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
      { fields: ['title'] },
      { fields: ['issuedDate'] },
      { fields: ['createdAt'] },
      { fields: ['published', 'issuedDate'] }
    ]
  });
};

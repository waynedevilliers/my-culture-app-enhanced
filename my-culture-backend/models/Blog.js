import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Blog", {
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
  }, {
    indexes: [
      { fields: ['userId'] },
      { fields: ['imageId'] },
      { fields: ['createdAt'] },
      { fields: ['title'] }
    ]
  });
};

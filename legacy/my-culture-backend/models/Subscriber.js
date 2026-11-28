import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Subscriber", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.STRING,
      enum: ["pending", "active"],
      defaultValue: "pending"
    },
  });
};
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("CertificateRecipient", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: "Recipient Name must be between 3 and 255 characters.",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Must be a valid email address.",
        },
      },
    },
    certificateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Certificates", key: "id" },
      onDelete: "CASCADE",
    },
    recipientUrl: {
      type: DataTypes.STRING,
    },
  });
};

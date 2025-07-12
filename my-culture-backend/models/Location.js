import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define('Location', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    houseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        is: /^[0-9]{5}$/, // Validates German postal codes (5 digits)
      },
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -180,
        max: 180,
      },
    },
  });
};
import { DataTypes } from 'sequelize';
import { isHttpUrl } from '../utils/urlValidator.js';

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
        // Sequelize's isUrl rejects localhost, so local development uploads
        // would fail. Accept any absolute http(s) URL instead.
        isHttpUrl(value) {
          if (!isHttpUrl(value)) {
            throw new Error('URL must be a valid http or https URL.');
          }
        },
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
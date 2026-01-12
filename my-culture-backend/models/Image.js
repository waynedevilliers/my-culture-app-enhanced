import { DataTypes } from 'sequelize';

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
        isValidUrl(value) {
          // Allow localhost URLs for local development
          const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/;
          const isLocalhost = localhostRegex.test(value);

          // Allow regular URLs (Sequelize's isUrl validator)
          const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
          const isValidUrl = urlRegex.test(value);

          if (!isLocalhost && !isValidUrl) {
            throw new Error('URL must be a valid HTTP/HTTPS URL');
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
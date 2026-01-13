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
        isUrl: true, // Use Sequelize's built-in URL validator
        isCustomValidUrl(value) { // Renamed for clarity, combines custom checks
          // Allow localhost URLs for local development
          const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/;
          const isLocalhost = localhostRegex.test(value);

          // Allow Vercel Blob URLs
          const vercelBlobRegex = /^blob:https?:\/\//; 
          const isVercelBlob = vercelBlobRegex.test(value);
          
          const isStandardUrlValid = /^(https?:\/\/[^\s$.?#][^\s]*)$/i.test(value); 

          if (!isLocalhost && !isVercelBlob && !isStandardUrlValid) {
            throw new Error('URL must be a valid HTTP/HTTPS URL, localhost URL, or Vercel Blob URL.');
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
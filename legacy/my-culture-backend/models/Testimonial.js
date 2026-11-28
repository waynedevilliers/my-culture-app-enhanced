import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Testimonial', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: 'Name must be between 3 and 255 characters.',
        },
      },
    },
    affiliation: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [3, 255],
          msg: 'Affiliation must be between 3 and 255 characters.',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [3, 2000],
          msg: 'Description must be between 3 and 2000 characters.',
        }
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
        msg: 'Rating must be between 1 and 5.',
      }
    }
  });
}
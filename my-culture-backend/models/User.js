import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize) => {
  return sequelize.define('User', {
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [3, 40],
            msg: 'Name must be at between 3 and 40 characters.',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [3, 40],
            msg: 'Name must be at between 3 and 40 characters.',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email address already in use.',
        },
        validate: {
          isEmail: {
            msg: 'Email must be a valid email address',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true, 
        validate: {
          isNumeric: {
            msg: 'Phone number must be a number.',
          },
          len: {
            args: [8, 15],
            msg: 'Phone number must be between 8 and 15 characters.',
          }
        }
      },
      role: {
        type: DataTypes.STRING,
        enum: ["user", "admin"],
        defaultValue: "user",
      },
      newsletter: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
          if (user.email) user.email = user.email.toLowerCase();
        },
        beforeUpdate: async (user) => {
          if (user.password && user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
          if (user.email) user.email = user.email.toLowerCase();
        },
        afterCreate: (user) => {
          delete user.dataValues.password;
        },
      },
    },
    {
      indexes: [
        { fields: ['role'] },
        { fields: ['newsletter'] },
        { fields: ['role', 'newsletter'] },
        { fields: ['email'] }
      ]
    }
  );

}

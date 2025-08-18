import { DataTypes } from "sequelize";

export default (sequelize) => { 
  return sequelize.define("Organization", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: "Name must be between 3 and 255 characters.",
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
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Website must be a valid URL.",
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^\+(?:[0-9] ?){6,14}[0-9]$/,
          msg: "Phone must be a valid phone number.",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Email must be a valid email address.",
        },
      },
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: 'The published field must be true or false.',
        },
      },
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Logo must be a valid URL.",
        },
      },
    },
    adminUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      validate: {
        isInt: {
          msg: "Admin User ID must be an integer.",
        },
      },
    },
    approvalStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'approved', 'rejected']],
          msg: "Approval status must be pending, approved, or rejected.",
        },
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Approved at must be a valid date.",
        },
      },
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Rejected at must be a valid date.",
        },
      },
    },
    adminEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Admin email must be a valid email address.",
        },
      },
    },
    adminName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [2, 255],
          msg: "Admin name must be between 2 and 255 characters.",
        },
      },
    },
  });
}
import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Certificate", {
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
    issuedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Issued Date must be a valid date.",
        },
      },
    },
    issuedFrom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: "Issued From must be between 3 and 255 characters.",
        },
      },
    },
    certificateUrl: {
      type: DataTypes.STRING,
    },
    securePdfPath: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Secure PDF path must be less than 500 characters.",
        },
      },
    },
    securePngPath: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Secure PNG path must be less than 500 characters.",
        },
      },
    },
    secureHtmlPath: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Secure HTML path must be less than 500 characters.",
        },
      },
    },
    templateId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'elegant-gold',
      validate: {
        isIn: {
          args: [['elegant-gold', 'modern-minimal', 'academic-traditional', 'creative-artistic', 'corporate-professional']],
          msg: "Template ID must be one of the available templates.",
        },
      },
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "The published field must be true or false.",
        },
      },
    },
  }, {
    indexes: [
      { fields: ['published'] },
      { fields: ['title'] },
      { fields: ['issuedDate'] },
      { fields: ['createdAt'] },
      { fields: ['published', 'issuedDate'] }
    ]
  });
};

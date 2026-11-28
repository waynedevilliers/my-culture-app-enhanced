import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  // Add secure file path columns to Certificates table
  await queryInterface.addColumn('Certificates', 'securePdfPath', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });

  await queryInterface.addColumn('Certificates', 'securePngPath', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });

  await queryInterface.addColumn('Certificates', 'secureHtmlPath', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });

  // Add admin workflow columns to Organizations table
  await queryInterface.addColumn('Organizations', 'adminUserId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  await queryInterface.addColumn('Organizations', 'approvalStatus', {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  });

  await queryInterface.addColumn('Organizations', 'approvedAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await queryInterface.addColumn('Organizations', 'rejectedAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await queryInterface.addColumn('Organizations', 'adminEmail', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('Organizations', 'adminName', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  // Add indexes for performance
  await queryInterface.addIndex('Certificates', ['securePdfPath'], {
    name: 'certificates_secure_pdf_path_idx'
  });

  await queryInterface.addIndex('Certificates', ['securePngPath'], {
    name: 'certificates_secure_png_path_idx'
  });

  await queryInterface.addIndex('Organizations', ['adminUserId'], {
    name: 'organizations_admin_user_id_idx'
  });

  await queryInterface.addIndex('Organizations', ['approvalStatus'], {
    name: 'organizations_approval_status_idx'
  });

  await queryInterface.addIndex('Organizations', ['approvedAt'], {
    name: 'organizations_approved_at_idx'
  });

  // Update existing organizations to 'approved' status if they're published
  await queryInterface.sequelize.query(`
    UPDATE "Organizations" 
    SET "approvalStatus" = 'approved', "approvedAt" = NOW()
    WHERE "published" = true AND "approvalStatus" = 'pending'
  `);
};

export const down = async (queryInterface, Sequelize) => {
  // Remove indexes first
  await queryInterface.removeIndex('Organizations', 'organizations_approved_at_idx');
  await queryInterface.removeIndex('Organizations', 'organizations_approval_status_idx');
  await queryInterface.removeIndex('Organizations', 'organizations_admin_user_id_idx');
  await queryInterface.removeIndex('Certificates', 'certificates_secure_png_path_idx');
  await queryInterface.removeIndex('Certificates', 'certificates_secure_pdf_path_idx');

  // Remove columns from Organizations table
  await queryInterface.removeColumn('Organizations', 'adminName');
  await queryInterface.removeColumn('Organizations', 'adminEmail');
  await queryInterface.removeColumn('Organizations', 'rejectedAt');
  await queryInterface.removeColumn('Organizations', 'approvedAt');
  await queryInterface.removeColumn('Organizations', 'approvalStatus');
  await queryInterface.removeColumn('Organizations', 'adminUserId');

  // Remove columns from Certificates table
  await queryInterface.removeColumn('Certificates', 'secureHtmlPath');
  await queryInterface.removeColumn('Certificates', 'securePngPath');
  await queryInterface.removeColumn('Certificates', 'securePdfPath');
};
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  county_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER // in bytes
  },
  file_type: {
    type: DataTypes.STRING
  },
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  uploaded_by: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  document_type: {
    type: DataTypes.ENUM('policy', 'regulation', 'report', 'other'),
    defaultValue: 'policy'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['title'],
      using: 'BTREE'
    },
    {
      fields: ['category'],
      using: 'BTREE'
    },
    {
      fields: ['county_id'],
      using: 'BTREE'
    },
    {
      type: 'FULLTEXT',
      fields: ['title', 'description']
    }
  ]
});

Policy.associate = (models) => {
  Policy.belongsTo(models.County, { foreignKey: 'county_id' });
  Policy.belongsTo(models.User, { foreignKey: 'uploaded_by' });
};

module.exports = Policy;
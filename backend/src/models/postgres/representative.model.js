const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Representative = sequelize.define('Representative', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  office_address: {
    type: DataTypes.STRING
  },
  bio: {
    type: DataTypes.TEXT
  },
  office_hours: {
    type: DataTypes.JSONB
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  verification_documents: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  contact_preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      email: true,
      sms: false,
      push: true
    }
  },
  response_time_target: {
    type: DataTypes.INTEGER, // in hours
    defaultValue: 48
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Representative.associate = (models) => {
  Representative.belongsTo(models.User, { foreignKey: 'user_id' });
  Representative.belongsTo(models.Constituency, { foreignKey: 'constituency_id' });
};

module.exports = Representative;
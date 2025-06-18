const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const County = sequelize.define('County', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  population: {
    type: DataTypes.INTEGER
  },
  area: {
    type: DataTypes.FLOAT // in square kilometers
  },
  headquarters: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

County.associate = (models) => {
  County.hasMany(models.Constituency, { foreignKey: 'county_id' });
  County.hasMany(models.User, { foreignKey: 'county_id' });
  County.hasMany(models.Policy, { foreignKey: 'county_id' });
};

module.exports = County;
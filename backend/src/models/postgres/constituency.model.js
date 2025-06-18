const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Constituency = sequelize.define('Constituency', {
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
  county_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Counties',
      key: 'id'
    }
  },
  representative_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Representatives',
      key: 'id'
    }
  },
  population: {
    type: DataTypes.INTEGER
  },
  boundaries: {
    type: DataTypes.JSONB // GeoJSON data
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Constituency.associate = (models) => {
  Constituency.belongsTo(models.County, { foreignKey: 'county_id' });
  Constituency.belongsTo(models.Representative, { foreignKey: 'representative_id' });
  Constituency.hasMany(models.User, { foreignKey: 'constituency_id' });
};

module.exports = Constituency;
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    validate: {
      is: /^\+?[0-9]{10,15}$/
    }
  },
  role: {
    type: DataTypes.ENUM('citizen', 'representative', 'admin'),
    defaultValue: 'citizen'
  },
  county_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Counties',
      key: 'id'
    }
  },
  constituency_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Constituencies',
      key: 'id'
    }
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.associate = (models) => {
  User.belongsTo(models.County, { foreignKey: 'county_id' });
  User.belongsTo(models.Constituency, { foreignKey: 'constituency_id' });
  User.hasOne(models.Representative, { foreignKey: 'user_id' });
  User.hasMany(models.Message, { foreignKey: 'sender_id' });
  User.hasMany(models.Message, { foreignKey: 'recipient_id' });
  User.hasMany(models.Policy, { foreignKey: 'uploaded_by' });
};

module.exports = User;
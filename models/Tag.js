const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection.js');

class Tag extends Model {}

Tag.init(
  {
  id: {
    types: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,

  },
  tag_name: {
    types: DataTypes.STRING
  }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'tag',
  }
);

module.exports = Tag;

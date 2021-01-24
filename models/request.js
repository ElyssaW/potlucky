'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.request.belongsTo(models.user)
      models.request.belongsTo(models.location)
    }
  };
  request.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.TEXT,
    locationId: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    recipelink: DataTypes.TEXT,
    filled: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'request',
  });
  return request;
};
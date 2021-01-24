'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class offer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.offer.belongsTo(models.user)
      models.offer.belongsTo(models.location)
    }
  };
  offer.init({
    userId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    title: DataTypes.TEXT,
    content: DataTypes.TEXT,
    recipelink: DataTypes.TEXT,
    claimed: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'offer',
  });
  return offer;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.location.belongsToMany(models.user, {through: 'userLocation'})
    }
  };
  location.init({
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    street: DataTypes.STRING,
    address: DataTypes.STRING,
    zipcode: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'location',
  });
  return location;
};
'use strict';
const axios = require('axios')
require('dotenv').config()
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
      models.location.hasMany(models.offer)
      models.location.hasMany(models.request)
      models.location.belongsToMany(models.user, {through: 'userLocation'})
    }
  };
  location.init({
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    address: DataTypes.STRING,
    zipcode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lat: DataTypes.DECIMAL(10,8),
    long: DataTypes.DECIMAL(11,8),
  }, {
    sequelize,
    modelName: 'location',
  });

  // user.addHook('beforeCreate', (pendingLocation, options) => {
  //   let accessToken = process.env.API_KEY
  //   axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${pendingLocation.zipcode}.json?types=postcode&access_token=${accessToken}`)
  //   .then(response => {
  //     console.log(response)
  //   })
  // })

  return location;
};
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

  // location.addHook('beforeCreate', async (pendingLocation, options) => {
  //   console.log('------------------------------------------')
  //   console.log('Hit hook')
  //   console.log('------------------------------------------')
  //   let accessToken = process.env.API_KEY
  //   let zip = pendingLocation.zipcode
  //   let address = pendingLocation.address

  //   axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${zip}.json?types=postcode&access_token=${accessToken}`)
  //   .then(response => {
  //     console.log('Pending bbox')
  //     let bbox = response.data.features[0].bbox

  //     axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&types=address&access_token=${accessToken}`).then(response => {

  //       console.log('Pending location')
  //       pendingLocation.lat = response.data.features[0].center[0]
  //       pendingLocation.long = pendingLocation.lat = response.data.features[0].center[1]
  //     })
  //   })
  // })

  return location;
};
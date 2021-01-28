require('dotenv').config()
const express = require('express')
const layout = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('./config/ppConfig.js')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn.js')
const db = require('./models')
const methodOverride = require('method-override')
const axios = require('axios')

db.message.destroy({
    where: {
        senderId: 2
    }
})

db.message.destroy({
    where: {
        receiverId: 2
    }
})
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
const { use } = require('./config/ppConfig.js')

// db.message.destroy({
//     where: {
//         senderId: 2
//     }
// })

// db.message.destroy({
//     where: {
//         receiverId: 2
//     }
// })

db.user.findByPk(1).then(user => {
    db.user.findByPk(2).then(friend => {
        user.addFollower(friend).then(result => {
            console.log(result)
            user.getFollowers().then(friends => {
                console.log(user)
                console.log(friend)
                console.log(friends)
            })
        })
    })
})
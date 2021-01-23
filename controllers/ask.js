const express = require('express')
let router = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn.js')
const db = require('../models/index.js')

router.get('/search', (req, res) => {
    console.log('route hit')
    db.requests.findAll().then(requests => {
        res.render('request/search.ejs', {requests: requests})
    })
})

router.get('/new', isLoggedIn, (req, res) => {
    res.render('request/new.ejs')
})

module.exports = router
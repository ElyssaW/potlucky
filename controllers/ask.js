const express = require('express')
let router = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn.js')
const db = require('../models/index.js')

router.get('/new', isLoggedIn, (req, res) => {
    res.render('request/new.ejs')
})

router.post('/new', (req, res) => {
    db.request.create({
        title: req.body.title,
        locationId: req.body.locationId,
        content: req.body.content,
        recipelink: req.body.recipelink,
        filled: 0
    }).then(ask => {
        console.log(`Created ${ask}`)
        res.redirect('/request/search')
    })
})

router.get('/search', (req, res) => {
    console.log('route hit')
    db.request.findAll().then(requests => {
        res.render('request/search.ejs', {requests: requests})
    })
})

router.get('/edit/:id')

router.put('/edit/:id')

router.delete('/delete/:id')

module.exports = router
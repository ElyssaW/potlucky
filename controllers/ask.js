const express = require('express')
let router = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn.js')
const db = require('../models/index.js')

router.get('/new/:id', isLoggedIn, (req, res) => {
    db.user.findByPk(req.params.id).then(user => {
        user.getLocations().then(locations => {
            res.render('request/new.ejs', {locations:locations})
        })
    })
})

router.post('/new', (req, res) => {
    db.request.create({
        title: req.body.title,
        locationId: req.body.locationId,
        content: req.body.content,
        recipelink: req.body.recipelink,
        filled: 0
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
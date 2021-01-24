const { request } = require('express')
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
    }).then(request => {
        db.location.findByPk(req.body.locationId).then(location => {
            location.addRequest(request).then(() => {
                db.user.findByPk(req.body.userId).then(user => {
                    user.addRequest(request).then(() => {          
                        console.log(`Created ${request}`)
                        res.redirect('/request/search')
                    })
                })
            })
        })
    })
})

router.get('/search', async (req, res) => {
    console.log('route hit')
    db.request.findAll({
        include: [db.user, db.location]
    }).then(requests => {
        console.log(requests)
        res.render('request/search.ejs', {requests: requests})
    })
})

router.get('/show/:id', (req, res) => {
    db.request.findByPk(req.params.id).then(request => {
        res.render('request/show.ejs', {request:request})
    })
})

router.get('/edit/:id')

router.put('/edit/:id')

router.delete('/delete/:id')

module.exports = router
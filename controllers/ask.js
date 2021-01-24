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
                        res.redirect('/request/search')
                    })
                })
            })
        })
    })
})

router.get('/search', (req, res) => {
    db.request.findAll({
        include: [db.user, db.location]
    }).then(requests => {
        res.render('request/search.ejs', {requests: requests})
    })
})

router.get('/show/:id', (req, res) => {
    db.request.findByPk(req.params.id, {include: [db.user, db.location]}).then(request => {
        res.render('request/show.ejs', {request:request})
    })
})

router.get('/edit/:id', (req, res) => {
    db.request.findByPk(req.params.id, {include: [db.user, db.location]}).then(request => {
        res.render('request/edit.ejs', {request:request})
    })
})

router.put('/edit/:id', (req, res) => {
    db.request.update({
        title: req.body.title,
        content: req.body.content,
        recipelink: req.body.recipelink
    }, {
        where: {
            id: req.params.id },
        returning: true,
        plain: true
        
    }).then(([rowsChanged, request]) => {
        console.log(request)
        if (req.body.locationId !== request.locationId) {
            console.log('IDs did not match -----------------------------')
            console.log(req.body.locationId)
            console.log(request.locationId)
            db.location.findByPk(request.locationId).then(location => {
                console.log(location)
                location.removeRequest(request).then(() => {
                    db.location.findByPk(req.body.locationId).then(newLoc => {
                        newLoc.addRequest(request).then(() => {
                            res.redirect('/request/show/' + req.params.id)
                        })
                    })
                })
            })
        } else {
            res.redirect('/request/show/' + req.params.id)
        }
    })  
})

router.delete('/delete/:id', (req, res) => {
    db.request.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/request/search')
    })
})

module.exports = router
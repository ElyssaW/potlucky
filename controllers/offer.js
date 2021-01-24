const express = require('express')
let router = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn.js')
const db = require('../models/index.js')

router.get('/new', isLoggedIn, (req, res) => {
    res.render('offer/new.ejs')
})

router.post('/new', (req, res) => {
    db.offer.create({
        title: req.body.title,
        locationId: req.body.locationId,
        content: req.body.content,
        recipelink: req.body.recipelink,
        filled: 0
    }).then(offer => {
        db.location.findByPk(req.body.locationId).then(location => {
            location.addOffer(offer).then(() => {
                db.user.findByPk(req.body.userId).then(user => {
                    user.addOffer(offer).then(() => {
                        res.redirect('/offer/search')
                    })
                })
            })
        })
    })
})

router.get('/search', (req, res) => {
    db.offer.findAll({
        include: [db.user, db.location]
    }).then(offers => {
        res.render('offer/search.ejs', {offers: offers})
    })
})

router.get('/show/:id', (req, res) => {
    db.offer.findByPk(req.params.id, {include: [db.user, db.location]}).then(offer => {
        res.render('offer/show.ejs', {offer:offer})
    })
})

router.get('/edit/:id', (req, res) => {
    db.offer.findByPk(req.params.id, {include: [db.user, db.location]}).then(offer => {
        res.render('offer/edit.ejs', {offer:offer})
    })
})

router.put('/edit/:id', (req, res) => {
    db.offer.update({
        title: req.body.title,
        content: req.body.content,
        recipelink: req.body.recipelink
    }, {
        where: {
            id: req.params.id },
        returning: true,
        plain: true
        
    }).then(([rowsChanged, offer]) => {
        if (req.body.locationId !== offer.locationId) {
            db.location.findByPk(offer.locationId).then(location => {
                location.removeOffer(offer).then(() => {
                    db.location.findByPk(req.body.locationId).then(newLoc => {
                        newLoc.addOffer(offer).then(() => {
                            res.redirect('/offer/show/' + req.params.id)
                        })
                    })
                })
            })
        } else {
            res.redirect('/offer/show/' + req.params.id)
        }
    })  
})

router.delete('/delete/:id', (req, res) => {
    db.offer.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/offer/search')
    })
})

module.exports = router
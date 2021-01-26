const express = require('express')
let router = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn.js')
const db = require('../models/index.js')
const { Op } = require("sequelize")
const { off } = require('process')

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
    let lat
    let long

    if (res.locals.currentUser) {
        lat = res.locals.currentUser.locations[0].lat
        long = res.locals.currentUser.locations[0].long
    } else {
        lat = -98.4936
        long = 29.4241
    }

    let bbox = [lat-1, long-1, parseFloat(lat)+1, parseFloat(long)+1]

    db.offer.findAll({
        where: {
            [Op.and]: [
            {
                '$location.lat$': {
                    [Op.between]: [bbox[0], bbox[2]]
                }
            }, {
                '$location.long$': {
                    [Op.between]: [bbox[1], bbox[3]]
                }
            }
        ]
    },
        include: [db.user, db.location]
    }).then(offers => {
        let geojson = {
            type: 'FeatureCollection',
        }

        geojson.features = offers.map(offer => {
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(offer.location.lat), parseFloat(offer.location.long)]
                },
                properties: {
                    title: 'Mapbox',
                    description: offer.content
                }
            }
        })

        res.render('offer/search.ejs', {offers: offers, 
                                        loc: {lat:lat, long:long},
                                        apiKey: process.env.API_KEY,
                                        geojson: geojson})
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
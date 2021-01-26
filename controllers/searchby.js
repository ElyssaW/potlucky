const express = require('express')
let router = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn.js')
const db = require('../models/index.js')
const { Op } = require("sequelize")

router.get('/', (req, res) => {
    console.log('----------------------')
    console.log(req.body.title)
    console.log('----------------------')

    res.render('searchby/home.ejs')
})

router.post('/', (req, res) => {
    console.log('----------------------')
    console.log(req.body)
    console.log('----------------------')

    let lat
    let long
    let bbox = []

    if (res.locals.currentUser) {
        lat = res.locals.currentUser.locations[0].lat
        long = res.locals.currentUser.locations[0].long
    } else {
        lat = -98.4936
        long = 29.4241
    }

    if (req.body.targetSearch === 'on') {
        bbox = [lat-1, long-1, parseFloat(lat)+1, parseFloat(long)+1]
    } else {
        bbox = [-100, -100, 100, 100]
    }
    
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
            }, {
                [Op.or]: [
                {
                    title: {
                        [Op.like]: `%${req.body.key}%`
                    }
                }, {
                    content: {
                        [Op.like]: `%${req.body.key}%`
                    }
                }, {
                    recipelink: {
                        [Op.like]: `%${req.body.key}%`
                    }
                }, {
                    '$location.address$': {
                        [Op.like]: `%${req.body.key}%`
                    }
                }, {
                    '$location.city$': {
                        [Op.like]: `%${req.body.key}%`
                    }
                }
            ]}
        ]
    },
        include: [db.user, db.location]
    }).then(offers => {

        db.request.findAll({
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
                }, {
                    [Op.or]: [
                    {
                        title: {
                            [Op.like]: `%${req.body.key}%`
                        }
                    }, {
                        content: {
                            [Op.like]: `%${req.body.key}%`
                        }
                    }, {
                        recipelink: {
                            [Op.like]: `%${req.body.key}%`
                        }
                    }, {
                        '$location.address$': {
                            [Op.like]: `%${req.body.key}%`
                        }
                    }, {
                        '$location.city$': {
                            [Op.like]: `%${req.body.key}%`
                        }
                    }
                ]}
            ]
        },
            include: [db.user, db.location]
        }).then(offers => {
        res.render('searchby/results.ejs', {results: offers, 
                                            loc: {lat:lat, long:long},
                                            apiKey: process.env.API_KEY})
    })
})

router.get('/show/:id', (req, res) => {
    db.offer.findByPk(req.params.id, {include: [db.user, db.location]}).then(offer => {
        res.render('offer/show.ejs', {offer:offer, apiKey: process.env.API_KEY})
    })
})

router.get('/edit/:id', (req, res) => {
    db.offer.findByPk(req.params.id, {include: [db.user, db.location]}).then(offer => {
        res.render('offer/edit.ejs', {offer:offer})
    })
})

module.exports = router
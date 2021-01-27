const { request } = require('express')
const { Op } = require("sequelize")
const express = require('express')
let router = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn.js')
const db = require('../models/index.js')

router.get('/new/:type', isLoggedIn, (req, res) => {
    res.render('request/new.ejs', {type: req.params.type})
})

router.post('/new', (req, res) => {
    db.request.create({
        title: req.body.title,
        locationId: req.body.locationId,
        content: req.body.content,
        recipelink: req.body.recipelink,
        type: req.body.type,
        filled: 0
    }).then(request => {
        db.location.findByPk(req.body.locationId).then(location => {
            location.addRequest(request).then(() => {
                db.user.findByPk(req.body.userId).then(user => {
                    user.addRequest(request).then(() => {
                        res.redirect('/request/search/' + req.body.type)
                    })
                })
            })
        })
    })
})

router.get('/search/:type', (req, res) => {
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

    console.log(req.params.type)

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
            },
            {
                type: req.params.type
            }
        ]
    },
        include: [db.user, db.location]
    }).then(requests => {

        let loc = {lat:lat, long:long}

        let markers = []

        requests.forEach(request => {

            let object = {
                lat: request.location.lat,
                long: request.location.long,
                title: request.title,
                address: request.location.address,
                color: '#D46C4E'
            }

            markers.push(object)
        })

        res.render('request/search.ejs', {
            loc: loc, 
            requests: requests,
            apiKey: process.env.API_KEY,
            markers: markers,
            markersLength: markers.length
        })
    })
})

router.get('/show/:id', (req, res) => {
    db.request.findByPk(req.params.id, {include: [db.user, db.location]}).then(request => {
        res.render('request/show.ejs', {request:request, apiKey: process.env.API_KEY})
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

router.delete('/fill/:id', (req, res) => {
    console.log('Route hit -------------------------')
    db.request.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        db.user.findByPk(req.body.user).then(user => {
            let fills = user.fills + 1

            db.user.update( {
                fills: fills
            }, {
                where: {
                    id: req.body.user
                    },
                    returning: true
                }
            ).then(() => {
                console.log(user.fills)
                res.redirect('/request/search/request')
            })
        })
    })

})

router.delete('/delete/:id', (req, res) => {
    db.request.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/request/search/request')
    })
})

module.exports = router
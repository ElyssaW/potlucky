const { request } = require('express')
const { Op } = require("sequelize")
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
    console.log(res.locals.currentUser.locations[0].lat)
    console.log(res.locals.currentUser.locations[0].long)
    let accessToken = process.env.API_KEY
    let lat = res.locals.currentUser.locations[0].lat
    let long = res.locals.currentUser.locations[0].long
    let bbox = [lat-1, long-1, parseFloat(lat)+1, parseFloat(long)+1]
    console.log(bbox)

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
            }
        ]
    },
        include: [db.user, db.location]
    }).then(requests => {
        console.log(requests)
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
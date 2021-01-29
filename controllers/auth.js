
const express = require('express')

let db = require('../models')

let router = express.Router()

const passport = require('../config/ppConfig.js')

const axios = require('axios')

// Signup route
router.get('/signup', (req, res) => {
    res.render('auth/signup.ejs')
})

//Confirm signup, to ensure the user has selected their address
router.get('/signup/confirm', (req, res) => {
    let apiKey = process.env.API_KEY
    res.render('auth/signupConfirm.ejs', {apiKey: apiKey, loc: { lat:-98.43340300, long:29.65028000}})
})

// Post signup
router.post('/signup', (req, res) => {
    if(!req.body.aviurl) {
        req.body.aviurl = '/Images/avatars/' + (Math.floor(Math.random() * 4)+1) + '.jpg'
    }

    let accessToken = process.env.API_KEY
    let zip = req.body.zipcode
    let address = req.body.address

    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${zip}.json?types=postcode&access_token=${accessToken}`)
    .then(response => {
        if (response.data.features.length > 0) {
            let bbox = response.data.features[0].bbox

            axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&types=address&access_token=${accessToken}`)
            .then(response => {
                if (response.data.features.length > 0) {
                    console.log(req.body)
                    db.user.findOrCreate({
                        where: {
                            email: req.body.email
                        },
                            defaults: {
                                name: req.body.name,
                                password: req.body.password,
                                usertype: req.body.usertype,
                                fills: 0,
                                reqs: 0,
                                likes: 0,
                                aviurl: req.body.aviurl
                            }
                    })
                    .then(([user, wasCreated])=>{
                        console.log(user)
                        if(wasCreated){  
                            let lat = response.data.features[0].center[0]
                            let long = response.data.features[0].center[1]
                                
                            db.location.findOrCreate({
                                where: {
                                    city: req.body.city,
                                    address: req.body.address,
                                    zipcode: req.body.zipcode,
                                    lat: lat,
                                    long: long,
                                    country: 'US'
                                }
                            }).then(([location, wasCreated]) => {
                                user.addLocation(location).then(() => {
                                    passport.authenticate('local', {
                                        successRedirect: '/',
                                        successFlash: 'Account created and user logged in!'
                                    })(req, res)
                                })
                            })
                        } else {
                            req.flash('error', 'An account associated with that email address already exists! Did you mean to log in?')
                            res.redirect('/auth/login')
                        }
                    })
                    .catch(err=>{
                        req.flash('error', err.message)
                        res.redirect('/auth/signup')
                    })
                } else {
                    req.flash('error', 'Location could not be found. Is the address correct?')
                    res.redirect('/auth/signup')
                }
            })
        } else {
            req.flash('error', 'Location could not be found. Is the address correct?')
            res.redirect('/auth/signup')
        }
    })
})


// Get authentication
router.get('/login', (req, res) => {
    res.render('auth/login.ejs')
})

// Post login
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login',
    successRedirect: '/',
    successFlash: 'You are now logged in',
    failureFlash: 'Invalid email or password'
}))

// Logout route
router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router
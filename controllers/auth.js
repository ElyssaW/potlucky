
const express = require('express')

let db = require('../models')

let router = express.Router()

const passport = require('../config/ppConfig.js')

// Signup route
router.get('/signup', (req, res) => {
    res.render('auth/signup.ejs')
})

// Post signup
router.post('/signup', (req, res) => {
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
            likes: 0
        }
    })
    .then(([user, wasCreated])=>{
        if(wasCreated){
            console.log('Creating location')
            db.location.findOrCreate({
                where: {
                    city: req.body.city,
                    address: req.body.address,
                    zipcode: req.body.zipcode,
                    state: req.body.state,
                    country: 'US'
                }
            }).then(([location, wasCreated]) => {
                console.log('Location created, adding...')
                user.addLocation(location).then(() => {
                    console.log('Location added. Yay!')
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
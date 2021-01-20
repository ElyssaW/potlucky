
const express = require('express')

let router = express.Router()

// Signup route
router.get('/signup', (req, res) => {
    res.render('auth/signup.ejs')
})

// Post signup
router.post('/signup', (req, res) => {
    console.log('signup')
    console.log(req.body)
    res.redirect('/profile')
})

// Get authentication
router.get('/login', (req, res) => {
    res.render('auth/login.ejs')
})

// Post login
router.post('/login', (req, res) => {
    console.log('login')
    console.log(req.body)
    res.redirect('/profile')
})

// Logout route
router.get('/logout', (req, res) => {
    res.render('auth/logout.ejs')
})

module.exports = router
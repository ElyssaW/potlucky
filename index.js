require('dotenv').config()
const express = require('express')
const layout = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('./config/ppConfig.js')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn.js')

// Instantiate express
let app = express()

// Set the view engine
app.set('view engine', 'ejs')
app.use(layout)

// Body parser
app.use(express.urlencoded({ extended: false }))

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Flash middleware
app.use(flash()) 

// CUSTOM MIDDLEWARE
app.use((req, res, next) => {
    res.locals.alerts = req.flash()
    res.locals.currentUser = req.user
    next() // move onto the next piece
})

// Import modules
app.use('/auth', require('./controllers/auth'))

// Home route
app.get('/', (req, res) => {
    res.render('home.ejs')
})

// Profile route
app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile.ejs')
})

app.get('*', (req, res) => {
    res.render('404.ejs')
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Hello from port 3000')
})
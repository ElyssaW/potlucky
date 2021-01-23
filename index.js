require('dotenv').config()
const express = require('express')
const layout = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('./config/ppConfig.js')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn.js')
const db = require('./models')

// Instantiate express
let app = express()

// Set the view engine
app.set('view engine', 'ejs')
app.use(layout)

// Body parser
app.use(express.urlencoded({ extended: false }))

// Public folder
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

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
app.use('/auth', require('./controllers/auth.js'))
app.use('/offer', require('./controllers/offer.js'))
app.use('/request', require('./controllers/ask.js'))

// Home route
app.get('/', (req, res) => {
    res.render('home.ejs')
})

// Profile route
app.get('/profile/:id', isLoggedIn, (req, res) => {
    db.user.findByPk(req.params.id).then(user => {
        user.getLocations().then(locations => {
            console.log(locations)
            res.render('profile.ejs', {locations: locations})
        })
    })
})

app.get('*', (req, res) => {
    res.render('404.ejs')
})

app.listen(process.env.PORT, () => {
    console.log('Hello from port 3000')
})
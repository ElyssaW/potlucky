require('dotenv').config()
const express = require('express')
const layout = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('./config/ppConfig.js')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn.js')
const db = require('./models')
const methodOverride = require('method-override')
const axios = require('axios')

// Instantiate express
let app = express()

// Set the view engine
app.set('view engine', 'ejs')
app.use(layout)

// Method override middleware
app.use(methodOverride('_method'))

// Body parser
app.use(express.urlencoded({ extended: false }))

// Public folder
const path = require('path')
const { use } = require('./controllers/ask.js')
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
    console.log('middleware')
    if(req.user) {
        res.locals.currentUser = req.user
        next() // move onto the next piece
    } else {
        res.locals.currentUser = req.user
        next() // move onto the next piece
    }
})

// Import modules
app.use('/auth', require('./controllers/auth.js'))
app.use('/request', require('./controllers/ask.js'))
app.use('/searchby', require('./controllers/searchby.js'))

// Home route
app.get('/', (req, res) => {
    res.render('home.ejs')
})

// Profile route
app.get('/profile/:id', isLoggedIn, (req, res) => {
    db.user.findByPk(req.params.id).then(user => {
        user.getLocations().then(locations => {
            user.locations = locations
            user.getRequests().then(requests => {
                user.requests = requests
                
                res.render('profile.ejs', {user:user})
            })
        })
    })
})

app.get('/test', (req, res) => {
    let accessToken = process.env.API_KEY
    let zip = 78259
    let street = '22210 Midbury'
    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${zip}.json?types=postcode&access_token=${accessToken}`)
    .then(response => {
        let bbox = response.data.features[0].bbox
        axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${street}.json?bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&types=address&access_token=${accessToken}`).then(response => {
            res.send(response.data)
        })
    })
})

app.get('*', (req, res) => {
    res.render('404.ejs')
})

app.listen(process.env.PORT, () => {
    console.log('Hello from port 3000')
})
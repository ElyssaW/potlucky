const express = require('express')
const layout = require('express-ejs-layouts')

// Instantiate express
let app = express()

// Set the view engine
app.set('view engine', 'ejs')
app.use(layout)

// Body parser
app.use(express.urlencoded({ extended: false }))

// Import modules
app.use('/auth', require('./controllers/auth'))

// Home route
app.get('/', (req, res) => {
    res.render('home.ejs')
})

// Profile route
app.get('/profile', (req, res) => {
    res.render('profile.ejs')
})

app.listen(3000, () => {
    console.log('Hello from port 3000')
})
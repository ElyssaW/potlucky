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

// Instantiate socket.io
const http = require('http').Server(app)
const io = require('socket.io')(http)

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
    if(req.user) {
        res.locals.currentUser = req.user
        res.locals.socketId = 0
        next() // move onto the next piece
    } else {
        res.locals.currentUser = req.user
        next() // move onto the next piece
    }
    
    console.log('middleware')
    console.log(res.locals)
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

// Message route
app.get('/message/:id', isLoggedIn, (req, res) => {
    db.user.findByPk(req.params.id).then(user => {
        user.getMessages().then(messages => {
            user.messages = messages
            res.render('message.ejs', {user:user})
        })
    })
})

app.get('*', (req, res) => {
    res.render('404.ejs')
})

let socketUsers = {}

io.on('connection', (socket) => {
    let userId = socket.handshake.headers.userid
    socketUsers[userId] = socket.id
    console.log('ping ----------------------------')
    console.log(socket)
    console.log(socketUsers)

    socket.on('private message', (msg, targetUser) => {
        let targetId = socketUsers[targetUser]

        db.message.create({
            content: msg,
            senderId: userId,
            receiverId: targetUser
        }).then(message => {
            db.user.findByPk(userId).then(sender => {
                message.addUser(sender).then(() => {
                    db.user.findByPk(targetUser).then(receiver => {
                        message.addUser(receiver).then(() => {
                            console.log('message ----------------------------')
                            console.log('Targeted user is ' + targetUser)
                            console.log(targetId)
                            console.log(msg)
                            io.to(targetId).emit('private message', msg, targetId)
                        })
                    })
                })
            })
        })
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })
})

http.listen(process.env.PORT, () => {
    console.log('Hello from port 3000')
})
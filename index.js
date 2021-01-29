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

app.get('/test', (req, res) => {
    res.send('Request received')
})

// Profile route
app.get('/profile/:id', isLoggedIn, (req, res) => {
    db.user.findByPk(req.params.id).then(user => {
        user.getLocations().then(locations => {
            user.locations = locations
            user.getRequests().then(requests => {
                user.getFollowers().then(followers => {
                    user.getFollowees().then(followees => {
                        user.requests = requests
                        user.followers = followers
                        user.followees = followees

                        let followsYou = false;
                        let following = false;

                        user.followees.forEach(followee => {
                            if (followee.id === req.user.id) {
                                followsYou = true
                            }
                        })

                        user.followers.forEach(follower => {
                            if (follower.id === req.user.id) {
                                following = true
                            }
                        })
                    
                        res.render('profile.ejs', {user:user, following:following, followsYou:followsYou})
                    })
                })
            })
        })
    })
})

// Friend route
app.get('/friend/:id', isLoggedIn, (req, res) => {
    db.user.findByPk(req.params.id).then(user => {
        db.user.findByPk(req.user.id).then(currentUser => {
            user.addFollower(currentUser).then(() => {
                currentUser.addFollowee(user).then(() => {
                    res.redirect('/profile/' + user.id)
                })
            })
        })
    })
})

app.get('/location/:id', (req, res) => {
    db.user.findByPk(req.params.id).then(user => {
        user.getLocations().then(locations => {
            console.log(locations)
            user.location = locations[0]
            
            res.render('auth/location.ejs', {user:user})
        })
    })
})

app.put('/location/edit/:id', (req, res) => {
    let accessToken = process.env.API_KEY
    let zip = req.body.zipcode
    let address = req.body.address

    db.user.findByPk(req.body.userId).then(user => {

        axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${zip}.json?types=postcode&access_token=${accessToken}`)
        .then(response => {
            if (response.data.features.length < 1) {
                console.log('Address does not exist -bbox')
                req.flash('error', 'Location could not be found. Is the address correct?')
                res.redirect('/profile/' + req.body.userId)
            } else {
                let bbox = response.data.features[0].bbox
                axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&types=address&access_token=${accessToken}`).then(response => {

                    if (response.data.features.length < 1) {
                        console.log('Address does not exist -bbox')
                        req.flash('error', 'Location could not be found. Is the address correct?')
                        res.redirect('/profile/' + req.body.userId)
                    } else {
                        let lat = response.data.features[0].center[0]
                        let long = response.data.features[0].center[1]

                        user.removeLocation(req.body.locId).then(() => {

                            db.location.findOrCreate({
                                where: {
                                    address: req.body.address,
                                    city: req.body.city,
                                    zipcode: req.body.zipcode,
                                    lat: lat,
                                    long: long
                                }
                            }).then(([location, wasCreated]) => {
                                user.addLocation(location).then(() => {
                                    console.log(location)
                                    res.redirect('/profile/' + req.body.userId)
                                })
                            })
                        })
                    }
                })
            }
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

    io.to(socketUsers[userId]).emit('currently online', socketUsers)

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
                            io.to(socketUsers[userId]).emit('message sent', message.id)
                            io.to(targetId).emit('private message', msg, targetId, message.id)
                        })
                    })
                })
            })
        })
    })

    socket.on('delete message', (id) => {
        db.message.destroy(
            {where: {id: id}}
        ).then(() => {
            console.log('Message deleted')
        }) 
    })
})

http.listen(process.env.PORT, () => {
    console.log('Hello from port 3000')
})
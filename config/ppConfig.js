const passport = require('passport')
const db = require('../models')
const LocalStrategy = require('passport-local')
const user = require('../models/user')

// ---------------------> SERIALIZE <--------------------- //

// Tell passport to serialize the user using
// the id by passing it into the doneCallback
passport.serializeUser((user, doneCallback) => {
    console.log('serializing the user...')
    doneCallback(null, user.id)
})

// tells passport how to deserialize the user now by looking it up in 
// the database based on the id (which was stored in the session)
passport.deserializeUser((id, doneCallback) => {
    db.user.findByPk(id)
    .then(foundUser => {
        foundUser.getLocations().then(locations => {
            console.log('Deserializing user...')
            foundUser.locations = locations
            doneCallback(null, foundUser)
        })
    })
    .catch(err => {
        console.log('ERROR deserializing user')
    })
})

// ------------------> STRATEGY SET UP <------------------ // 

const findAndLogInUser = ((email, password, doneCallback) => {
    // tell passport how to check that our user is legit
    db.user.findOne({
        where: {
            email: email
        }
    })
    .then(async foundUser => {
        let match
        if (foundUser) {
            console.log('Comparing passwords')
            //check that the password is legit
            match = await foundUser.validPassword(password)
        }
        if(!foundUser || !match) {
            // This happens when there's funky users
            console.log('Password was not validated')
            return doneCallback(null, false)
        } else {
            foundUser.getLocations().then(locations => {
                foundUser.locations = locations
                return doneCallback(null, foundUser)
            })
        }
    })
    .catch(error => {
        doneCallback(error)
    })
})

// Think of doneCallback as a function that looks like this:
// login(error, userToBeLoggedIn) {
    // do stuff
// }
// we provide null if there's no error, or "false" if there's no user or
// if the password is invalid (like they did in the passport-local)
// docs

const fieldsToCheck = {
    usernameField: 'email',
    passwordField: 'password'
}

// Creating an instance of local strategy
// ->>>> constructor arg 1:
// an object that indicates how we're going to refer to the two fields
// we're checking (for ex. we're using email instead of username)
// ->>>> constructor arg 2
// a callback that is ready to receive the two fields we're checking
// as well as a doneCallback

const strategy = new LocalStrategy(fieldsToCheck, findAndLogInUser)

passport.use(strategy)


module.exports = passport
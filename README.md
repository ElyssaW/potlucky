# PotLucky!

A "community kitchen" app that connects local cooks and bakers looking to make some food with people in their area looking to eat some food. Users sign up on the app, and can create new "offers," where they offer food they've made or would like to make up for other users to come pick up. Or they can create "requests," where they ask for a particular dish, or at a particular time/date, and post the request for other users to fill.

## Tech Stack
- HTML/CSS/Javascript
- Express
- Postgres/Sequelize
- EJS Layouts
- Mapbox API
- Mapbox GL JS plugin
- Socket.io
- SCSS

### MVP

- [x] Basic CRUD functionality (Create/Read/Update/Delete offers and requests)
- [x] Database with tables for users, requests, and offers
- [x] Geocoding API to find users in your area

### Stretch Goals

- [ ] Recipe search (New datatable for recipes?) (NOTE: I couldn't find a suitable API that was free-use, so this has been nixed)
- [x] In-app messaging (Socket.io?) (NOTE: I wish I could mark something as halfway done. The DM system is there and semi-functional, but pretty buggy.)
- [x] Visual map representation (Mapbox GL?)

### How to use
Download and run nodemon in the project file. Place port of choice, session secret and a mapbox API key in a .env file. Then, open the website and sign up! You can search requests/offers in your area, make your own of either, search by keyword (Globally and locally) and follow/PM fellow users.

#### In your .env
- PORT=[your port number]
- API_KEY=[Mapbox API key]
- SESSION_SECRET=[session secret]

## ERD

![ERD](/Images/ERD.png)

## Wireframes

![Landing](/Images/LandingPage.png)

![Request](/Images/RequestPage.png)

![Show](/Images/ShowPage.png)

![Profile](/Images/ProfilePage.png)

### Roadblocks

The MVP seems very doable - the only new challenge there is geocoding, and the Mapbox API seems to be pretty helpful. The stretch goals are a bit more of a challenge. Is Socket.io a good choice for in-app messaging? I played around with it and got a universal chat system working, but can I make it do private DMs, user to user? How challenging will a map visualization be? 

### POST-PROJECT WRITE-UP

This project isn't quite as polished as Spellcheckers, but it had the half the time, and I'm pretty happy with what I accomplished with it. I'd like to continue fixing the small bugs and QoL fixes that I wasn't able to get to, and after that, some more added functionality - like display usernames instead of just user index
# PotLucky!

A "community kitchen" app that connects local cooks and bakers looking to make some food with people in their area looking to eat some food. Users sign up on the app, and can create new "offers," where they offer food they've made or would like to make up for other users to come pick up. Or they can create "requests," where they ask for a particular dish, or at a particular time/date, and post the request for other users to fill.

## Tech Stack
- HTML/CSS/Javascript
- Express
- Postgres/Sequelize
- EJS Layouts
- Mapbox API
- Mapbox GL JS plugin

### MVP

- [x] Basic CRUD functionality (Create/Read/Update/Delete offers and requests)
- [x] Database with tables for users, requests, and offers
- [ ] Geocoding API to find users in your area

### Stretch Goals

- [ ] Recipe search (New datatable for recipes?)
- [ ] In-app messaging (Socket.io?)
- [ ] Visual map representation (Mapbox GL?)

## ERD

![ERD](Public/images/ERD.png)

## Wireframes

![Landing](Public/images/LandingPage.png)

![Request](Public/images/RequestPage.png)

![Show](Public/images/ShowPage.png)

![Profile](Public/images/ProfilePage.png)

### Roadblocks

The MVP seems very doable - the only new challenge there is geocoding, and the Mapbox API seems to be pretty helpful. The stretch goals are a bit more of a challenge. Is Socket.io a good choice for in-app messaging? I played around with it and got a universal chat system working, but can I make it do private DMs, user to user? How challenging will a map visualization be? 
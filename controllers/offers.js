const { Model } = require("sequelize/types")

const express = require(express)
const db = require('./models')
const router = express.Router()

router.get('/search', (req, res) => {
    res.render('offers/search.ejs')
})

router.get('/new/:id', (req, res) => {
    res.render('offers/new.ejs')
})

router.post('/new/:id', (req, res) => {
    res.render('offers/new.ejs')
})

router.get('/edit/:id', (req, res) => {
    res.render('offers/edit.ejs')
})

router.put('/edit/:id', (req, res) => {
    res.render('offers/edit.ejs')
})

router.get('/:id', (req, res) => {
    res.render('offers/show.ejs')
})

router.delete('/:id', (req, res) => {
    res.render('offers/show.ejs')
})

module.exports = router
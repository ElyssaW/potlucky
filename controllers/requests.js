const db = require('./models')
const express = require(express)
const router = express.Router()

router.get('/search', (req, res) => {
    res.render('request/search.ejs')
})

router.get('/new/:id', (req, res) => {
    res.render('request/new.ejs')
})

router.post('/new/:id', (req, res) => {
    res.render('request/new.ejs')
})

router.get('/edit/:id', (req, res) => {
    res.render('request/edit.ejs')
})

router.put('/edit/:id', (req, res) => {
    res.render('request/edit.ejs')
})

router.get('/:id', (req, res) => {
    res.render('request/show.ejs')
})

router.delete('/:id', (req, res) => {
    res.render('request/show.ejs')
})

module.exports = router
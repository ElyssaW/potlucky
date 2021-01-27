const express = require('express')
require('dotenv').config()
let db = require('../models')
let router = express.Router()
const passport = require('../config/ppConfig.js')
const axios = require('axios')

router.get('/', (req, res) => {
    res.render('recipes/search.ejs')
})

router.post('/', (req, res) => {
    console.log('route hit')
    let keywords = req.body.keyword
    console.log(keywords)
    keywords = keywords.split(' ')
    console.log(keywords)
    let spoonKey = process.env.SPOON_KEY

    keywords = keywords.map((word, i) => {
        if ( i === 0 ) {
            return word
        } else {
            return `+${word}`
        }
    })
    console.log(keywords)

    let ingredients = keywords.join()

    console.log(ingredients)

    let url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${spoonKey}`
    
    console.log(url)
    
    axios.get(url)
    .then(response => {
        console.log(response)
    })
})

module.exports = router
const express = require('express')
const router = express.Router()
// const path = require('path');
// const request = require('request');
// const session = require('express-session');

// @route GET api/
router.get('/', (req, res) => {
    res.send('Hello from homepage')
})

// @route GET api/staff
router.get('/staff', (req, res) => {
});
    // dont send webpage via express
    // use express for api
    // gulp will handle page
    // change the folder name if you want to


module.exports = router
const express = require('express');
const homePage = require('./routes/homepage/routes')
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')
// viewed at http://localhost:8080
const PORT = 8000
app.use(cors())
app.use(bodyParser.json())

app.use('/api', homePage)

app.listen(PORT, () => {
    console.log (`server running on port ${PORT}`)
})

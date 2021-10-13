const express = require('express')
const { Router } = require('express')
const app = express()

// Import Routes
const authRoute = require('./routes/auth')

// Route middlewares
app.use('/api/user', authRoute)

app.listen(3000, () => console.log("Server Up and running!"))

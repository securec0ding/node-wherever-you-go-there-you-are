const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const session = require('express-session')

const app = express()

app.set('view engine', 'pug')
app.set('trust proxy', 1)
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// use sessions for tracking logins
app.use(session({
  secret: 'SUPERSECRET',
  resave: true,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}))

mongoose.connect('mongodb://localhost:27017/openRedirectDemo',
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
)

const routes = require('./routes/router')
app.use('/', routes)

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message)
})

app.listen(process.env.VIRTUAL_PORT, () => console.log('Server running...'))
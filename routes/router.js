const express = require('express')
const router = express.Router()
const url = require('url')

const User = require('../models/User')

router.get('/', (req, res, next) => {
  res.render('index', {
    redirect: req.query.redirect
  })
})

router.post('/', (req, res, next) => {
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.')
    err.status = 400
    return next(err)
  } else if (req.body.email && req.body.password) {
    var userData = {
      email: req.body.email,
      password: req.body.password
    }
    User.create(userData, (error, user) => {
      if (error) {
        return next(error)
      } else {
        req.session.userId = user._id
        return res.redirect('/profile')
      }
    })
  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, (error, user) => {
      if (error || !user) {
        var err = new Error('Wrong email or password.')
        err.status = 401
        return next(err)
      } else {
        req.session.userId = user._id

        var redirect = req.query.redirect
        if (redirect !== 'undefined' && redirect.indexOf('//') == -1) {
          return res.redirect(redirect)
        } else { res.redirect('/profile')
        }
      }
    })
  } else {
    var err = new Error('All fields required.')
    err.status = 400
    return next(err)
  }
})

// User authentication/redirection middleware
router.use('/*', (req, res, next) => {
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error)
    } else {
      if (user === null) {
        return res.redirect('/?redirect='+req.originalUrl)
      } else {
        res.locals.user = user
        next()
      }
    }
  })
})

router.get('/profile', (req, res, next) => {
  return res.render('profile', {
    user: res.locals.user
  })
})

router.get('/members', (req, res, next) => {
  User.find((error, members) => {
    return res.render('members', {
      user: res.locals.user,
      members: members
    })
  })
})

router.get('/delete', (req, res, next) => {
  User.remove({
    "_id": req.session.userId
  }).exec((error, user) => {
    if (error) {
      return next(error)
    } else {
      req.session.destroy((err) => {
        if (err) {
          return next(err)
        } else {
          return res.redirect('/')
        }
      })
    }
  })
})

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err)
      } else {
        return res.redirect('/')
      }
    })
  }
})

module.exports = router
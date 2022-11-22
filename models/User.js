var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
})

//authenticate input against database
UserSchema.statics.authenticate = (email, password, cb) => {
  User.findOne({ email: email, password: password }).exec((err, user) => {
    if (err) {
      return cb(err)
    } else if (!user) {
      var err = new Error('Login failed.')
      err.status = 401
      return cb(err)
    } else {
      return cb(null, user)
    }
  })
}

var User = mongoose.model('User', UserSchema)
module.exports = User
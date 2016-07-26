var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/user');

module.exports = mongoose;
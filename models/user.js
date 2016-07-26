var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    user: {
        type: String,
        unique: true,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
});


exports.User = mongoose.model('User', schema);
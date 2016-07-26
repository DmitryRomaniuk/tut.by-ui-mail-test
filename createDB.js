var mongoose = require('./lib/mongoose');
var async = require('async');

function getUsers(data,callback) {
    async.series([
        open,
        dropDatabase,
        requireModels,
        createUsers,
        listUser
    ], function(err) {
        data.users=listUsers;
        mongoose.disconnect();
        callback();
    });
}


function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('./models/user');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {
    var users = [
        {user: 'test-user-9-simple@tut.by', pass: '12345678'},
        {user: 'test-user-10-simple@tut.by', pass: '12345678'}
    ];

    async.each(users, function(userData, callback) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    },callback);
}
var listUsers;

function listUser(callback) {
    var User = require('./models/user').User;
        User.find({},function (err,users){
            if(err) throw err;
            listUsers=users;
            callback()
        })
}
module.exports = getUsers;
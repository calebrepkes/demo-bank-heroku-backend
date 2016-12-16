/**
 * Created by caleb on 02/12/2016.
 */
var db = require('./../helpers/databaseConfiguration');
var async = require('async');
var moment = require('moment');

exports.performLogin = function (req, res) {
    console.log('*< Started Perform Login >*');
    async.waterfall([
        function (next) {
            validateCredentials(req, next)
        },
        function (document, next) {
            generateNewToken(document, next)
        }
    ], function (error, response) {
        if (error == "Error") {
            console.log('Unauthorized!');
            res.status(500).json({code: 302, authenticateStatus: "AuthenticationFailure", message: response});
        } else if (error == null && response) {
            console.log('Authorized and logged in.');
            res.status(200).json({authenticateStatus: "AuthenticationSuccessfull", token: response});
        }
        console.log('*> Finished Perform Login <*');
    })
};

exports.sessionManagement =function (req, next) {
    console.log('*< Started Session management >*')
    async.waterfall([
        function (next) {
            validateToken(req, next)
        }
    ], function (error, token) {
        if (error == "Error") {
            console.log('sessionManagement Token Unauthorized!');
            next("Error", "InvalidToken");
        } else if (error == null && token) {
            console.log('sessionManagement Token authorized and logged in.');
            next(null, true);
        }
        console.log('*> Finished Session management <*');
    })
};

exports.performLogout = function (req, res) {
    console.log('*< Logout sequence started >*')
    async.waterfall([
        function (next) {
            validateToken(req, next)
        },
        function (document, next) {
            deleteToken(req, next)
        }
    ], function (error, document) {
        if (error == "Error") {
            console.log('logout failed');
            res.status(200).json({ authenticateStatus: "AuthenticationRemovalFailure"});;
        } else if (error == null && document == "Deleted") {
            console.log('Performing logout');
            res.status(200).json({ authenticateStatus: "AuthenticationRemoved"});
        }
        console.log('*> Finished Perform Logout <*');
    })
};

/********************************************************************************************************************
 *                      Private functions                                                                           *
 ********************************************************************************************************************/

/**
 * validateCredentials - Return the Authorised user platform
 */
var validateCredentials = function(auth, next) {
    console.log('** validateCredentials **');
    var usrN = auth.body.username;
    var pw = auth.body.password;
    console.log("Incomming auth.package in validateCredentials: " + usrN + ' & ' + pw);
    usersTable().findOne({username: usrN, password: pw},function(error, document){
        if (document){
            console.log('We found your credentials in the database.');
            next(null, document);
        } else if (document == null) {
            console.log('*** MISSING PERSON *** We could not find you!');
            next("Error", "Not found");
        } else {
            console.log('Not an existing user yet.');
            next("Error", "Something went wrong");
        }
    })
};

var generateNewToken = function(document, next) {
    console.log('** generateNewToken **');
    var token = randomToken();
    var expirationDate = futureTimestamp();
    if (document) {
        console.log('Adding this new token: '+token+' to user with this expDate: '+expirationDate); // TODO remove this token logging
        tokenTable().updateOne(
            { "parent_id" : document._id },
            { $set: { "token": token, "expiry_date": expirationDate, "valid": true } }
        );
        next(null, token);
    } else {
        console.log('Failure in adding token to user.')
        next("Error", "Failure during Login.");
    }
};

/**
 * validateToken - Validate given token, by finding it in the database.
 */
var validateToken = function(req, next) {
    console.log('** validateToken **');
    var token = req.body.token;
    console.log("Validating token: "+token); // TODO remove this token logging
    var today = currentTimestamp();
    tokenTable().findOne({token: token}, function(error, document) {
        if (document) {
            console.log('We found the token in the db.');
            var expDate = document.expiry_date;
            var validity = document.valid;
            console.log('The actual expirydate: ' + expDate + ' and valid status: '+validity);
            if (expDate < today || validity == false) {
                console.log('Token has expired.')
                next("Error", null);
            } else if (expDate > today || validity == true) {
                console.log('Expiration date is still bigger then current date, so current token is still valid.');
                next(null, document);
            }
        } else {
            console.log('*** Invalid token ***');
            next("Error", null);
        }
    })
};

/********************************************************************************************************************
 *                      Private util functions                                                                      *
 ********************************************************************************************************************/

// Our current table for registered accounts is parents
function usersTable() {
    console.log('Is this an issue?');
    return db.get().collection('parents');
}
function tokenTable() {
    return db.get().collection('tokens');
}
function randomToken() {
    return "1"+Math.floor((Math.random() * 9999999) + 1000000);
}
function currentTimestamp() {
    var newCurrentTimestamp = moment().format();
    console.log('New current Timestamp: '+newCurrentTimestamp);
    return newCurrentTimestamp;
}
function futureTimestamp() {
    var newFutureTimestamp = moment(currentTimestamp()).add(12, 'months').format();
    console.log('New expiration Date:   '+newFutureTimestamp);
    return newFutureTimestamp;
}
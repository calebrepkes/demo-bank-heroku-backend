/**
 * Created by caleb on 06/12/2016.
 */
var db = require('./../helpers/databaseConfiguration');
var async = require('async');
//var moment = require('moment');
const session = require('./session.js');

exports.performCreatePayments = function (req, res) {
    console.log('*< Started create Payments >*');
    async.waterfall([
        function (next) {
            session.sessionManagement(req, next)
        },
        function (document , next) {
            createPayment(req, next)
        }
    ], function (error, response) {
        if (error == "Error") {
            console.log('Creating of Payment failed');
            res.status(200).json({createPayment: "CreatePaymentFailure", message: response});
        } else if (error == null && response) {
            console.log('Creating of Payment success');
            var body = response.ops[0];
            var objectToResponse = {
                id: body._id,
                payment_id: body.payment_id,
                own_account: body.own_account,
                beneficiary: body.beneficiary,
                amount: body.amount
            };
            res.status(200).json({createPayment: "CreatePaymentSuccess", message: objectToResponse});
        }
        console.log('*> Finished create Payments <*')
    })
};

/********************************************************************************************************************
 *                      Private functions                                                                           *
 ********************************************************************************************************************/

/**
 * createPayment - Create a Payment
 */
var createPayment = function (payment, next) {
    console.log('** createPayment **');
    var payment_id = payment.body.payment_id;
    var own_account = payment.body.own_account;
    var beneficiary = payment.body.beneficiary;
    var amount = payment.body.amount;
    objectToInsert = {payment_id: payment_id, own_account: own_account, beneficiary: beneficiary, amount: amount};
    console.log('Will add this Payment to the database: '+payment_id);
    paymentTable().insertOne(objectToInsert, {new: true}, function (error, document) {
        if (document) {
            console.log('Payment created');
            next(null, document);
        } else {
            console.log('Payment could not be born');
            next("Error", null);
        }
    })
};

/********************************************************************************************************************
 *                      Private util functions                                                                      *
 ********************************************************************************************************************/

function paymentTable() {
    return db.get().collection('Payments');
}

// function randomPaymentToken() {
//     return "6"+Math.floor((Math.random() * 9999999) + 1000000);
// }
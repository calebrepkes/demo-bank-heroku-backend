/**
* @Created by Caleb Repkes
* @Description: ...
* @(C) Demo-Bank App backend
* @ver.0.1
* @changes: Caleb Repkes
* @rev by: ...
*/
var app = require('express')();
var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var db = require('./api/helpers/databaseConfiguration.js');
var url = process.env.MONGODB_URI;

module.exports = app; // for testing

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Connect to Mongo on start
db.connect(url, function(err) {
    if (err) {
        console.log('Unable to connect to Mongo.')
        process.exit(1)
    }
    console.log('Connected to Mongo.')
    }
);

var config = {
    appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { throw err; }

    // Add swagger-ui (This must be before swaggerExpress.register)
    app.use(SwaggerUi(swaggerExpress.runner.swagger));

    // install middleware
    swaggerExpress.register(app);

    var port = process.env.PORT || 5001;
    app.listen(port);
    console.log('Listening on: ' + port);
    console.log('Check: http://localhost:'+port+'/docs for documenation');
});

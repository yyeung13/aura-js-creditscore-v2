/*
 * GET list of all scores. Will return a simple Welcome message first!
 * Then we will enhance this method to connect to a MySQL service broker instance,
 * run a simple query and return a response message.
 *
 * Note: In this version we don't persist any scores so there are no scores to return.
 */

exports.list = function(req, res){
    console.log("Entering list all scores function V2");
    console.log(req.body);

    var resultData = {

// _CHANGE_ : Please comment the line with the DUMMY message and uncomment the one with the Welcome message
        //"MESSAGE": "DUMMY message V2"
        "MESSAGE": "Welcome to aura-js-creditscore version V2"

    };

    console.log("Access the env variable in nodejs. Value of : process.env" + process.env);
    console.log("Access the env variable in nodejs. Value of : process.env.DB_INFO" + process.env.DB_INFO);

// _CHANGE_Part_3_Service_Broker_Integration_ : Please uncomment the entire db code block below to use DB
/*
// Start of db code block
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        // TODO Replace hardcoded values with that from mysql service broker K8s secret
        host     : 'mysql-sb-inst-1-mysql.default.svc.cluster.local',
        user     : 'root',
        password : 'vzmWaPDPEO'
    });

    connection.query('SELECT 1', function (error, results, fields) {
        if (error) {
            console.log("DB communication error : " + error);
        } else {
            console.log("Connected to DB");
            console.log("Query execution results: " + results);
            console.log("Query execution results: " + fields);
        }

    });
// End of db code block
*/
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(resultData));
};



var SCORE_MAX = 800;
var SCORE_MIN = 550;
var util = require('util');

/*
 * POST scoring.
 */

exports.score = function(req, res){
    if (req.is('application/json')) {
        console.log("JSON");
        console.log(req.body);
        var person = JSON.parse(JSON.stringify(req.body));
        var firstname = person.firstname,
            lastname = person.lastname,
            dateofbirth = person.dateofbirth,
            ssn = person.ssn;
    } else {

        console.log('Request body: ' + util.inspect(req.body));
        var firstname = req.body.firstname,
            lastname = req.body.lastname,
            dateofbirth = req.body.dateofbirth,
            ssn = req.body.ssn;
    }
    var score = firstname.hashCode() + lastname.hashCode() + dateofbirth.hashCode() + ssn.hashCode();

    score = score % SCORE_MAX;

    while (score < SCORE_MIN) {
        score = score + 100;
    }

    var resultData = { "firstname": firstname,
        "lastname": lastname,
        "ssn": ssn,
        //"ssn": "999-99-9999",
        "dateofbirth": dateofbirth,
        "score": score
    };


    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(resultData));
};

/*
 * Hashcode for String.
 */

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) {
        return hash;
    }
    for (i = 0; i < this.length; i++) {
        /*jslint bitwise: true */
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};


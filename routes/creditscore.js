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

/*
 * GET list of all scores. In this version we don't persist any scores so there is nothing to return
 */

exports.list = function(req, res){
    console.log("Entering list all scores function V2");
    console.log(req.body);

    var resultData = {
        "MESSAGE": "Welcome to aura-js-creditscore version V2)"
    };

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : 'mysql-sb-inst-1-mysql.default.svc.cluster.local',
        user     : 'root',
        password : 'vzmWaPDPEO'
    });

    connection.query('SELECT 1', function (error, results, fields) {
        if (error) {
            console.log("DB communication error : " + error);
        } else {
            console.log("Query execution results: " + results);
        }

    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(resultData));
};


/*
 * Insert credit score
 */

const insertCreditScore = function(creditScore, db, callback) {
    console.log("Entering insertCreditScore function");
    db.collection('credit-scores').insertMany([creditScore], function(err, result) {
        if (err) {
            console.log("Error inserting credit score in mongo: " + err);
        } else {
            console.log("Inserted credit score in mongo");
//            assert.equal(1, result.result.n);
//            assert.equal(1, result.ops.length);
            console.log("Inserted 1 creditscore into the collection: " + result);
            callback(result);
        }
    });
}

/*
 * Get all credit scores
 */

const getAllCreditScores = function(db, callback) {
    // Get the credit-scores collection
    const collection = db.collection('credit-scores');
    // Find all documents
    collection.find({}).toArray(function(err, docs) {
        if (err) {
            console.log("Error finding credit scores in mongo: " + err);
        } else {
            console.log("Found the following credit scores");
            console.log(docs);
            callback(docs);
        }
    });
}


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
//const url = 'mongodb://root:MSCCRVKOIA@mongodb-sb-inst-1-mongodb.default.svc.cluster.local:27017/admin';
const url = 'mongodb://mongodb-sb-inst-1-mongodb.default.svc.cluster.local:27017/test';

// Database Name
//const dbName = 'credit-score';


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

    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to server .. Proceeding to insert the credit score");

//        const db = client.db(dbName);

        // Use this method to save a credit score
        insertCreditScore(resultData, db, function() {
            console.log("Inserted the credit score");
//            client.close();
            db.close();
        });

    });


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
        "SERVICE VERSION": "aura-js-creditscore V2",
        "MESSAGE": "NO SCORES - (SAVE NOT IMPLEMENTED IN aura-js-creditscore V2)"
    };

    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        // Use this method to get all credit scores
        resultData = getAllCreditScores(db, function() {
            client.close();
        });

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
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log("Inserted 1 creditscore into the collection");
        callback(result);
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
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs);
        callback(docs);
    });
}

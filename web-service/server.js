/*
    server.js
    main server script for our task list web service
*/

'use strict';

var express = require('express'); // save the public interface to the express module to a lcl var
var sqlite = require('sqlite3');
var bodyParser = require('body-parser');

var SQL_CREATE_TABLE = 'create table if not exists tasks(title string, done int, createdOn, datetime)'

var app = express();
var port = 8080;

// // when the client requests the root resource, call this function
// app.get('/', function(req, res){
// 	res.send('<h1>Hello World</h1>');
// });

// tell express to serve static files from the /static directory
app.use(express.static(__dirname + '/static')) // returns the static middleware handler, __dirname == current directory

// tell express to parse post body data as JSON
app.use(bodyParser.json());

app.get('/api/tasks', function(rec,res,next) {
	db.all('select rowid, title, done, createdOn from tasks where done != 1', function(err, rows){
		if(err) {
			return next(err); // don't throw an error because the server is now running
		}

		// send data in JSON to client
		res.json(rows);

	});
});

// Insert a new task API
app.post('/api/tasks', function(req, res, next){
	var newTask = {
		title: req.body.title || 'New Task',
		done: false,
		createdOn: new Date()
	};

	var sql = 'insert into tasks(title, done, createdOn) values(?,?,?)';
	db.run(sql, [newTask.title, newTask.done, newTask.createdOn], function(err){
		if(err) {
			return next(err);
		}

		newTask.rowid = this.lastID;
		res.status(201)
			.location('/api/tasks/' + newTask.rowid)
			.json(newTask);
	});
});

// update a task API
app.put('/api/tasks/:rowid', function(req, res, next){
	var sql = 'update tasks set done=? where rowid=?';
	db.run(sql, [req.body.done, req.params.rowid], function(err) {
		if (err) {
			return next(err);
		}
		res.json(req.body);
	});
});

// register global error handler for express
// recognized as an error handler because the function has 4 arguments
app.use(function(err, req, res, next) {
	console.error(err.stack); // log stack trace
	res.status(500).json({
		message: err.message
	});
});

var db = new sqlite.Database(__dirname + '/data/tasks.db', function(err){
	if (err){
		throw err;
	}

	db.run(SQL_CREATE_TABLE, function(err){
		if(err) {
			throw err;
		}
		app.listen(port, function() {
			console.log('server is listening on http://localhost:' + port); // console.log prints to the server's console, not the browser
		});
	});
});

// close the database when the process exits
process.on('exit', function(){
	if(db) {
		console.log('closing the database');
		db.close();
	}
});



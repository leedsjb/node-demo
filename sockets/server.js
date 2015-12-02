/*
    server.js
    main server script for the socket.io chat demo
*/

var net = require('net');

var server = net.createServer();
// all clients
var clients = [];

server.on('connection', function(socket) {

	var name;


	function broadcast(name, message) {
		clients.forEach(function(client){
			if(client != socket) {
				client.write('[' + name + ']' + message);
			}
		}); // call function once for every element in the array
	};

	clients.push(socket); // hold on to the new client

	console.log('new connection');
	socket.write('Hello! What is your name?\n'); // write back to the client

	// capture the data the client sends
	socket.on('data', function(data){
		if(!name) {
			name = data.toString();
			socket.write('Hi there ' + name + '\n');
			// socket.end();
		} else {
			broadcast(name, data.toString());
		}
	});

	socket.on('close', function(){
		console.log('connection closed');
	});

	// socket.end();
	
});

server.on('listening', function() {
	console.log('server listening...');
});

server.listen(3000);


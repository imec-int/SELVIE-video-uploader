#!/usr/bin/env node

var express = require('express');
var http = require('http')
var path = require('path');
var socketio = require('socket.io');
var fs = require('fs');
var utils = require('./utils');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('123456789987654321'));
	app.use(express.session());
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

var webserver = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

// Socket IO
var io = socketio.listen(webserver);


app.get('/', function (req, res){
	res.render('index', { title: 'SELVIE Video uploader' });
});

app.post('/xhrupload', function (req, res){
	if(!req.xhr) return utils.sendError(new Error('got no xhr request'), res);

	var size = req.header('x-file-size');
	var type = req.header('x-file-type');
	var name = path.basename(req.header('x-file-name'));



	// fix filename:
	name = utils.removeFileExt(name).replace(/([^a-z0-9]+)/gi, '-') + path.extname(name);
	name = Date.now() + '_' + name;
	var uploadedFile = path.join('public/data', name);

	var writeStream = fs.createWriteStream( uploadedFile );

	req.on('data', function (data) {
		writeStream.write(data);
	});

	req.on('end', function () {
		writeStream.end();
		console.log("XHR Upload done:", uploadedFile);

		fs.readdir('public/data', function (err, files) {
			res.send({err: 0, numberofuploadedfiles: files.length});
		});



	});
});




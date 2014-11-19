var App = function (options){

	var socket;
	var fileuploadEl = $("#fileinput");

	var init = function (){
		console.log("init");
		initSocket();
		initHandlers();
	};

	var initSocket = function (){
		if(socket) return; // already initialized

		socket = io.connect(window.location.hostname);

		// some debugging statements concerning socket.io
		socket.on('reconnecting', function(seconds){
			console.log('reconnecting in ' + seconds + ' seconds');
		});
		socket.on('reconnect', function(){
			console.log('reconnected');
		});
		socket.on('reconnect_failed', function(){
			console.log('failed to reconnect');
		});
		socket.on('connect', function() {
			console.log('socket connected');
		});
	};

	var initHandlers = function () {
		fileuploadEl.bind('change', onFileuploadChange);
	};


	var onFileuploadChange = function (event){
		showUploadPercentage(0);
		$('.thankyoumessage').text('');

		uploadFile(event.target.files[0], function (data){
			console.log('upload done!');
			showUploadPercentage(100);
			$('.thankyoumessage').text('Merci! We zitten al aan ' + data.numberofuploadedfiles + ' video\'s!');
		});
	};

	var uploadFile = function(file, callback){
		console.log("uploading file");
		// console.log(file);

		var xhr = new XMLHttpRequest(),
			upload = xhr.upload;

		upload.addEventListener("progress", function (ev) {
			if (ev.lengthComputable) {
				showUploadPercentage((ev.loaded / ev.total) * 100);
			}
		}, false);

		upload.addEventListener("load", function (ev) {
			console.log("upload complete");
		}, false);

		upload.addEventListener("error", function (ev) {
			console.log(ev);
		}, false);

		xhr.open(
			"POST",
			"/xhrupload"
		);
		xhr.setRequestHeader("Cache-Control", "no-cache");
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr.setRequestHeader("Content-Type", file.type);
		xhr.setRequestHeader("X-File-Name", file.name);

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback( JSON.parse(xhr.responseText) );
			}
		}

		xhr.send(file);
	};

	var showUploadPercentage = function (percentage) {
		if(percentage == 0)
			$('.uploadbar>.fill').removeClass('animate');
		else
			$('.uploadbar>.fill').addClass('animate');

		$('.uploadbar>.fill').css('width', percentage+'%');
		$('.uploadbar>.fill').width(); //force css update

		$('.uploadbar>.fill').addClass('animate');
	};



	return {
		init: init
	};
};



$(function(){
	var app = new App();
	app.init();
});


var fs = require('fs'),

    app;


var init = function() {

    fs.readFile(__dirname + '/../../config/client.js', function(err, data) {
        if(err) {
            console.log('[config] config/client.js does not yet exist');
            return;
        }

        console.log('[config] Loading config/client.js');

        try {
            data = JSON.parse(data);
            app.clientConfig = data;
        }
        catch(e) {
            console.log(e);
            console.log('[config] Error while parsing config/client.js');
        }

    });

    app.controllers.socket.addListener(socketListener);

};

var socketListener = function(message, socket) {

    // request configuration

    if(message.type === 'config') {
        app.controllers.socket.send(socket, {
            type: 'config',
            config: app.clientConfig
        });
    }

    // save configuration

    else if(message.type === 'config_save') {
        console.log('[config] Changing configuration');

        app.clientConfig = message.config;

        app.controllers.socket.broadcastToOthers(socket, {
            type: 'config',
            config: app.clientConfig
        });

        fs.writeFile(
            __dirname + '/../../config/client.js',
            JSON.stringify(app.clientConfig),
            function(err) {
                if(err) {
                    console.log('[config] config/client.js could not be saved!');
                }
            }
        );
    }

    // system reboot
    else if(message.type === 'reboot') {
    	var exec = require('child_process').exec;

	function execute(command, callback) {
		exec(command, function(error, stdout, stderr){ callback(stdout); });
	}

	execute('sudo shutdown -r now', function(callback) {
		console.log('[system_reboot] ' + callback);
	});
    }

    // system shutdown
    else if(message.type === 'shutdown') {
    	var exec = require('child_process').exec;

	function execute(command, callback) {
		exec(command, function(error, stdout, stderr){ callback(stdout); });
	}

	execute('sudo shutdown -h now', function(callback) {
		console.log('[system_shutdown] ' + callback);
	});
    }	

};


module.exports = function(globalApp) {
    app = globalApp;
    app.events.on('ready', init);
};

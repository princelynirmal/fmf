
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , favicon = require('serve-favicon')
  , bodyParser = require('body-parser')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , methodOverride = require('method-override')
  , errorHandler = require('errorhandler')
  , Uber = require('node-uber')
  , logger = require('morgan');

var app = express();

var UberObj;
var UberPrices;
var source_address_name;
var destination_address_name;

// all environments
// app.set('port', process.env.PORT || 8080);
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('server_ip_address', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/uberlogin/callback', function(req, res) {
	UberObj.authorization({
		authorization_code : req.query.code
	}, function(err, access_token, refresh_token) {
		if (err) {
			console.err(err);
		} else {
			res.redirect('/searchdirections.html');
		}
	});
});

app.post('/comparePrices', function(req, res){
	source_address_name      = req.body.source_address_name;
	destination_address_name = req.body.destination_address_name; 
	console.log(source_address_name);
	console.log(destination_address_name);
	UberObj.estimates.getPriceForRoute(req.body.source_address_lat,
			                           req.body.source_address_lng,
			                           req.body.destination_address_lat,
			                           req.body.destination_address_lng,
 			                           function(err, uber_response) {
									      if (err) {
									    	  console.error(err);
									      } else {
									    	  // res.redirect(303, '/searchdirections.html?data=' + encodeURIComponent(JSON.stringify(uber_response)));
									    	  res.redirect(303, '/searchdirections.html?data=' + encodeURIComponent(JSON.stringify(uber_response)) +
									    			                        '&source_address=' + encodeURIComponent(source_address_name) +
									    			                   '&destination_address=' + encodeURIComponent(destination_address_name));
									      }
                                       });
});

app.get('/comparerides', function(req, res) {
	res.writeHead(200);
	console.log(UberPrices);
	res.write(JSON.stringify(UberPrices));
	res.end();
});

app.get('/uberlogin', function(req, res) {
	    UberObj = new Uber({
		client_id: 'lMnHzWGTaP-0DQxR8UHb0thMEnnQWBTM',
		client_secret: 'fs-JM97RVFTCACnJQxn8xPXgsGMVLXckz7aTUJJv',
		server_token: 'tbSFeH5F2G4GDzaoi3oEfOqYMwObvG4HX3XWkFxx',
		redirect_uri: 'http://localhost:3000/uberlogin/callback',
		name: 'FetchMyFare',
		language:'en_US',
		sandbox: true
	});
    console.log('Uber object successfully instantiated');
    var authUrl = UberObj.getAuthorizeUrl(['ride_widgets']);
    res.redirect(authUrl);
});

http.createServer(app).listen(app.get('port'), server_ip_address, function(){
    console.log('Express server listening on port ' + app.get('port'));
});




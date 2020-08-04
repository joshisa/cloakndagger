'use strict';

const Keycloak = require('keycloak-connect');
const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 4000;

var session = require('express-session');
var path = require("path")
var cors = require('cors')

const app = express();
app.use(bodyParser.json());

app.use(cors())

// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// Provide the session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
//
// Additional configuration is read from keycloak.json file
// installed from the Keycloak web console.

var keycloakConfig ={
  "realm": "myrealm",
  "auth-server-url": "https://keycloak.maplesaver-2025abf5e73a457f12bb6f6fae6f9c13-0000.tor01.containers.appdomain.cloud/auth",
  "ssl-required": "external",
  "resource": "nodejs-example",
  "public-client": true,
  "confidential-port": 0
}

var keycloak = new Keycloak({
  store: memoryStore
},keycloakConfig);

app.use( keycloak.middleware( { logout: '/logout'} ));

//admin protected route
app.get('/secured-echo', keycloak.protect('realm:app-admin'), function(req,resp) {
  resp.send("Secured Hello");
});

//user protected route
app.get('/user-echo', keycloak.protect('realm:app-user'), function(req,resp) {
  resp.json({"say": "hello"});
});

//unprotected route
app.get('/echo', function(req,resp) {
  console.log(keycloakConfig)
  console.log(keycloak)
  resp.json({"say": "hello"});
});

app.get('/', function(req,resp) {
  resp.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function () {
  console.log('Listening at port: ' + port);
});

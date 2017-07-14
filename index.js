const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();
// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: false }));
// pass the passport middleware
app.use(passport.initialize());


// pass the authorization checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);


// start the server
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001 or http://127.0.0.1:3001');
});

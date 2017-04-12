const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const authHelper = require('./authHelper.js');
const config = require('../config.js');
const http = require('http');
const axios = require('axios')
const _ = require('lodash')

var app = express();
app.use(bodyParser.json()); // for parsing application/json

const sess = {secret: 'secret', cookie: {}};
app.use(session(sess));

const devMode = (config.environment != 'production');

function getUserFromSession(req, res, next) {
  const session = req.session;
  if (!session || !session.userDetails) {
    res.status(400).json({
      error: 'Unauthorized'
    });
  } else {
    req.user = session.userDetails;
    next();
  }
}

app.use('/api', getUserFromSession);

/////////////////////////////
// WEB
/////////////////////////////

app.use('/static', express.static(path.join(__dirname, '../public/')));

/////////////////////////////
// SPARK APIS
/////////////////////////////

const SPARK_HOST = process.env.SPARK_HOST || 'http://localhost:3000'
const fetchSpark = (path, options) => axios(`${SPARK_HOST}${path}`, options).then(r => r.data)
const handleStandardRequest = handler => (req, res) => {
    console.log(`Requesting ${req.path}`);
    return handler(req, res).then(data => res.status(200).send(data)).catch(e => {
      console.log(e)
      res.status(500).send(devMode ? e.toString() : 'Internal server error');
    })
}

app.get('/api/v1/volunteers', handleStandardRequest(req => fetchSpark('/volunteers/volunteers').then(data => (
      data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number, department: `TODO DEP ID${item.department_id}`, role: `TODO ROLE NAME ${item.role_id}`}, 
          _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id']))
      )
    )))
)

app.get('/api/v1/departments', handleStandardRequest(() => fetchSpark('/volunteers/departments/').then(depts => depts.map(n => _.assign({name: n.name_en}, n)))))
app.get('/api/v1/roles', handleStandardRequest(() => fetchSpark('/volunteers/roles/')))
app.get('/api/v1/departments/:dId/volunteers', handleStandardRequest(({params}) => fetchSpark(`/volunteers/departments/${params.dId}/volunteers/`)))

app.post('/api/v1/departments/:dId/volunteers/', handleStandardRequest((req, res) => (
  fetchSpark(`/volunteers/departments/${req.params.dId}/volunteers`, {method: 'post', 
    data: req.body.emails.map(email => ({email, role_id: req.body.role, is_production: req.body.is_production}))
  })
)))

require('./stubs').StubServer(app);

if (devMode) {
  require('./devServer').init(app)
}

app.use(express.static('public'));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }

  const token = req.query.token;

  // TODO: when spark auth api will be deployed, check if production
  req.session.token = token;
  req.session.userDetails = {
    firstName: 'user'
  };
  res.sendFile(path.join(__dirname, '../src/index.html'));

  // authHelper.GetUserAuth(token, res, (userDetails) => {
  //   req.session.token = token;
  //   req.session.userDetails = userDetails;
  //   res.sendFile(path.join(__dirname, '../src/index.html'));
  // });
});

const server = app.listen(config.port, function () {
  const host = server.address().address
  const port = server.address().port
  console.log("Listening at http://%s:%s", host, port)
})
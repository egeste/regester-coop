const lodash = require('lodash');
const moment = require('moment-timezone');
const SunCalc = require('suncalc-tz');

const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');

const schedule = require('./schedule');
// schedule.scheduleNextOperation();

const app = express();
app.set('view engine', 'ejs');

app.locals.lodash = lodash;
app.locals.moment = moment;
app.locals.SunCalc = SunCalc;

app.locals.config = config;
app.locals.pkg = require('../package.json');
app.locals.doorState = require('./doorstate');

app.use((req, res, next) => {
  Object.assign(req, schedule.getTimes());
  next();
});

app.get('/', (req, res) => {
  res.render('pages/index', { req });
});

app.get('/debug', (req, res) => {
  res.render('pages/debug', { req });
});

app.post('/rpc/door', bodyParser.json(), (req, res) => {
  try {
    require('./motor').toggleDoor(req.body.open)
      .then(() => res.redirect('/'))
      .catch(() => res.sendStatus(500));
  } catch (e) {
    res.redirect('/');
  }
});

app.listen(config.serverPort, () => {
  console.log(`Listening at http://localhost:${config.serverPort}`);
});


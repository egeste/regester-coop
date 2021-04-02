const fs = require('fs');
const tmp = require('tmp');
const lodash = require('lodash');
const moment = require('moment-timezone');
const SunCalc = require('suncalc-tz');
const ConsoleHook = require('console-hook');

const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const schedule = require('./schedule');

const logFile = tmp.fileSync();
const app = express();

app.set('view engine', 'ejs');

app.locals.lodash = lodash;
app.locals.moment = moment;
app.locals.SunCalc = SunCalc;

app.locals.config = config;
app.locals.pkg = require('../package.json');
app.locals.doorState = require('./doorstate');

const stream = fs.createWriteStream(logFile.name, { flags: 'a' });
app.use(morgan('combined', { stream }));
ConsoleHook(console).attach((method, args) => {
  stream.write(`${method.toUpperCase()}: ${JSON.stringify(args)}\n`);
});

app.use((req, res, next) => {
  Object.assign(req, schedule.getTimes());
  next();
});

app.get('/', (req, res) => {
  res.render('pages/index', { req });
});

app.get('/logs', (req, res) => {
  const output = fs.readFileSync(logFile.name);
  res.render('pages/logs', { req, output });
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

schedule.scheduleNextOperation();

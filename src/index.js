const fs = require('fs');
const tmp = require('tmp');
const lodash = require('lodash');

const moment = require('moment-timezone');
const SunCalc = require('suncalc-tz');

const express = require('express');
const storage = require('node-persist');
const bodyParser = require('body-parser');

const morgan = require('morgan');
const ConsoleHook = require('console-hook');

const getConfig = require('./config');
const schedule = require('./schedule');

const logFile = tmp.fileSync();
const app = express();

app.set('view engine', 'ejs');

app.locals.lodash = lodash;
app.locals.moment = moment;

app.locals.pkg = require('../package.json');
app.locals.doorState = require('./doorstate');

const stream = fs.createWriteStream(logFile.name, { flags: 'a' });
app.use(morgan('combined', { stream }));
ConsoleHook(console).attach((method, args) => {
  stream.write(`${method.toUpperCase()}: ${JSON.stringify(args)}\n`);
});

app.use(async (req, res, next) => {
  app.locals.times = await schedule.getTimes();
  app.locals.config = await getConfig();
  next();
});

app.get('/', (req, res) => {
  res.render('pages/index', { req });
});

app.get('/settings', (req, res) => {
  res.render('pages/settings', { req });
});

app.get('/debug', (req, res) => {
  const logs = fs.readFileSync(logFile.name);
  res.render('pages/debug', { req, logs });
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

(async () => {
  const config = await getConfig();
  app.listen(config.port, () => {
    console.info('Listening on port', config.port);
  });
})();

// schedule.scheduleNextOperation();

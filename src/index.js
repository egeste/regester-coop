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

(async () => {
  const config = await getConfig();

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
    const rawLogs = fs.readFileSync(logFile.name, { encoding: 'utf8' });
    const logs = rawLogs.split('\n').reverse().join('\n');
    res.render('pages/debug', { req, logs });
  });

  app.use(bodyParser.urlencoded());

  app.post('/rpc/door', (req, res) => {
    try {
      require('./motor').toggleDoor(req.body.open)
        .then(() => res.redirect('/'))
        .catch(() => res.sendStatus(500));
    } catch (e) {
      res.redirect('/');
    }
  });

  app.post('/rpc/update_settings', async (req, res) => {
    try {
      await storage.setItem('port', req.body.port);
      await storage.setItem('timezone', req.body.timezone);
      await storage.setItem('latitude', req.body.latitude);
      await storage.setItem('longitude', req.body.longitude);
      await storage.setItem('rpm', req.body.rpm);
      await storage.setItem('steps', req.body.steps);
      await storage.setItem('current', req.body.current);
      await storage.setItem('distance', req.body.distance);
      await storage.setItem('frequency', req.body.frequency);
      res.redirect('/settings');
    } catch (e) {
      res.sendStatus(500);
    }
  });

  app.listen(config.port, () => {
    console.info('Listening on port', config.port);
  });
})();

// schedule.scheduleNextOperation();

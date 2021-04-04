const moment = require('moment');
const SunCalc = require('suncalc-tz');
const storage = require('node-persist');
const schedule = require('node-schedule');

const getConfig = require('./config');

const getTimes = async () => {
  const { timezone, latitude, longitude } = await getConfig();

  return {
    today: moment().tz(timezone).startOf('day'),
    tomorrow: moment().tz(timezone).add(1, 'day').startOf('day'),
    todaysTimes: SunCalc.getTimes(moment().valueOf(), latitude, longitude),
    tomorrowsTimes: SunCalc.getTimes(moment().add(1, 'day').valueOf(), latitude, longitude)
  }
}

let nextOperation;
const getNextOperation = () => nextOperation;

const scheduleNextOperation = async () => {
  const config = await getConfig();
  const { todaysTimes, tomorrowsTimes } = await getTimes();

  const duskTonight = moment(todaysTimes.dusk);
  const dawnTomorrow = moment(tomorrowsTimes.dawn);

  if (moment().tz(config.timezone).isAfter(duskTonight)) {
    console.info('Scheduling an `open` operation for', dawnTomorrow.format('LLL'));
    nextOperation = { when: dawnTomorrow, what: 'openDoor' }
    schedule.scheduleJob(dawnTomorrow, () => {
      require('./motor').openDoor()
        .catch(err => console.error(err))
        .then(() => scheduleNextOperation());
    });
  } else {
    console.info('Scheduling a `close` operation for', duskTonight.format('LLL'));
    nextOperation = { when: duskTonight, what: 'closeDoor' }
    schedule.scheduleJob(duskTonight, () => {
      require('./motor').closeDoor()
        .catch(err => console.error(err))
        .then(() => scheduleNextOperation());
    });
  }
}

module.exports = { getTimes, scheduleNextOperation }

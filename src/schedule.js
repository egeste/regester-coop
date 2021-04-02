const moment = require('moment');
const SunCalc = require('suncalc-tz');
const schedule = require('node-schedule');
const config = require('./config');

const getTimes = () => ({
  today: moment().tz(config.timezone).startOf('day'),
  tomorrow: moment().tz(config.timezone).add(1, 'day').startOf('day'),
  todaysTimes: SunCalc.getTimes(moment().valueOf(), config.latitude, config.longitude),
  tomorrowsTimes: SunCalc.getTimes(moment().add(1, 'day').valueOf(), config.latitude, config.longitude)
});

let nextOperation;
const getNextOperation = () => nextOperation;
const scheduleNextOperation = () => {
  const { todaysTimes, tomorrowsTimes } = getTimes();
  const duskTonight = moment(todaysTimes.dusk);
  const dawnTomorrow = moment(tomorrowsTimes.dawn);

  if (moment().tz(config.timezone).isAfter(duskTonight)) {
    console.info('Scheduling an `open` operation for', dawnTomorrow.format('LLL'))
    nextOperation = { when: dawnTomorrow, what: 'openDoor' }
    schedule.scheduleJob(dawnTomorrow, () => {
      require('./motor').openDoor()
        .catch(err => console.error(err))
        .then(() => scheduleNextOperation());
    });
  } else {
    console.info('Scheduling a `close` operation for', duskTonight.format('LLL'))
    nextOperation = { when: duskTonight, what: 'closeDoor' }
    schedule.scheduleJob(duskTonight, () => {
      require('./motor').closeDoor()
        .catch(err => console.error(err))
        .then(() => scheduleNextOperation());
    });
  }
}

module.exports = { getTimes, scheduleNextOperation }

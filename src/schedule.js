const moment = require('moment');
const SunCalc = require('suncalc-tz');
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

const scheduleNextOperation = async () => {
  const config = await getConfig();
  const { todaysTimes, tomorrowsTimes } = await getTimes();

  const duskTonight = moment(todaysTimes.dusk);
  const dawnTomorrow = moment(tomorrowsTimes.dawn);

  const scheduleSpec = (moment().tz(config.timezone).isAfter(duskTonight)) ? {
    date: dawnTomorrow.valueOf(),
    operation: () => require('./motor').openDoor()
  } : {
    date: duskTonight.valueOf(),
    operation: () => require('./motor').closeDoor()
  }

  schedule.scheduleJob(scheduleSpec.date, async () => {
    const config = await getConfig();

    if (!config.automate) {
      return scheduleNextOperation();
    }

    scheduleSpec.operation()
      .catch(err => console.error(err))
      .then(() => scheduleNextOperation());
  });
}

module.exports = { getTimes, scheduleNextOperation }

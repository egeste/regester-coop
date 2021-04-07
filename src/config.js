require('dotenv').config();

const storage = require('node-persist');

module.exports = async () => {
  await storage.init();

  const port = parseInt(process.env.PORT || 3000);
  const automate = Boolean(await storage.getItem('automate'));

  const timezone = ((await storage.getItem('timezone')) || process.env.MOMENT_TIMEZONE || 'America/Los_Angeles');
  const latitude = parseFloat((await storage.getItem('latitude')) || process.env.GPS_LATITUDE || 0);
  const longitude = parseFloat((await storage.getItem('longitude')) || process.env.GPS_LONGITUDE || 0);

  const rpm = parseInt((await storage.getItem('rpm')) || process.env.MOTOR_RPM || 5);
  const steps = parseInt((await storage.getItem('steps')) || process.env.MOTOR_STEPS || 2048);
  const current = parseFloat((await storage.getItem('current')) || process.env.MOTOR_CURRENT || 0.4);
  const distance = parseInt((await storage.getItem('distance')) || process.env.MOTOR_DISTANCE || 1400);
  const frequency = parseInt((await storage.getItem('frequency') || process.env.MOTOR_FREQUENCY) || undefined);

  return {
    port, automate,
    timezone, latitude, longitude,
    rpm, steps, current, distance, frequency
  }
}

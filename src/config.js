require('dotenv').config();

module.exports = {
  timezone: (process.env.MOMENT_TIMEZONE || 'America/Los_Angeles'),
  latitude: (process.env.GPS_LATITUDE ? parseFloat(process.env.GPS_LATITUDE) : 0),
  longitude: (process.env.GPS_LONGITUDE ? parseFloat(process.env.GPS_LONGITUDE) : 0),
  serverPort: (process.env.PORT ? parseInt(process.env.PORT) : 3000),
  rpm: (process.env.MOTOR_RPM ? parseInt(process.env.MOTOR_RPM) : 5),
  steps: (process.env.MOTOR_STEPS ? parseInt(process.env.MOTOR_STEPS) : 2048),
  current: (process.env.MOTOR_CURRENT ? parseFloat(process.env.MOTOR_CURRENT) : 0.8),
  openDistance: (process.env.MOTOR_DISTANCE ? parseInt(process.env.MOTOR_DISTANCE) : 500),
}

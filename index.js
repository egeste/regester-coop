const Alexa = require('ask-sdk-core');
const MotorHat = require('motor-hat');
const exitHook = require('exit-hook');

const motorHat = MotorHat({
  address: 0x60, // For the official Adafruit hat
  steppers: [{ W1: 'M1', W2: 'M2' }]
}).init();

const doorMotor = motorHat.steppers[0];
doorMotor.setSteps(2048);
doorMotor.setCurrent(0.6);
doorMotor.setSpeed({ rpm: 5 });

doorMotor.step('fwd', 200, (err, result) => {
  if (err) return console.log('Oh no, there was an error', err);

  console.log(`
    Did ${result.steps} steps ${result.dir} in ${result.duration/1000} seconds.
    I had to retry ${result.retried} steps because you set me up quicker than your poor board can handle.
  `);

  process.exit(0);
});

exitHook(() => {
  doorMotor.releaseSync()
});

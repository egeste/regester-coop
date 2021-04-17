const { Command } = require('commander');
const exitHook = require('exit-hook');
const MotorHat = require('motor-hat');

const config = require('./config');
const package = require('../package.json');

const program = new Command();
program.version(package.version);

program.option('-t, --time <time>', 'hold the door for n seconds');
program.option('-d, --distance <distance>', 'move this many steps');
program.option('-r, --rpm <rpm>', 'set RPM (speed)');
program.option('-c, --current <current>', 'set current [ 0.0 - 1.0 ]');
program.option('-s, --steps <steps>', 'set the motor to this many steps');
program.option('-f, --frequency <frequency>', 'set the PWM frequency');
program.parse(process.argv);

const motorHat = MotorHat({
  address: 0x60, // For the official Adafruit hat
  steppers: [{ W1: 'M1', W2: 'M2' }]
}).init();

const options = program.opts();
const doorMotor = motorHat.steppers[0];

doorMotor.setSpeed({ rpm: parseInt(options.rpm || config.rpm) });
doorMotor.setSteps(parseInt(options.steps || config.steps));
doorMotor.setCurrent(parseFloat(options.current || config.current));

const freq = parseInt(options.frequency || config.frequency);
if (freq) { doorMotor.setFrequencySync(); }

// const rpm = 30;
// const radians = (degrees => degrees * (Math.PI/180))(1.8);
// const frequency = (rpm / ((radians/360) * 60));
// doorMotor.setSpeed({ rpm });
// doorMotor.setFrequencySync(frequency);

const time = parseInt(options.time || 5);
const distance = parseInt(options.distance || config.distance);

doorMotor.step('fwd', distance, (err, result) => {
  if (err) return console.error(err);
  console.info(`Did ${result.steps} steps ${result.dir} in ${result.duration/1000} seconds with ${result.retried} retries.`);

  doorMotor.setCurrent(0.01);

  setTimeout(() => {
    doorMotor.setCurrent(parseFloat(options.current || config.current));

    doorMotor.step('back', distance, (err, result) => {
      if (err) return console.error(err);
      console.info(`Did ${result.steps} steps ${result.dir} in ${result.duration/1000} seconds with ${result.retried} retries.`);
      process.exit(0);
    });
  }, (time * 1000));
});

exitHook(() => {
  doorMotor.releaseSync();
});

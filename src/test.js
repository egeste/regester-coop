const { Command } = require('commander');
const exitHook = require('exit-hook');
const MotorHat = require('motor-hat');

const package = require('../package.json');

const program = new Command();
program.version(package.version);

program.option('-r, --rpm <rpm>', 'set RPM (speed)');
program.option('-c, --current <current>', 'set current [ 0.0 - 1.0 ]');
program.option('-s, --steps <steps>', 'set the motor to this many steps');
program.option('-d, --distance <distance>', 'move this many steps')
program.parse(process.argv);
const options = program.opts();

const motorHat = MotorHat({
  address: 0x60, // For the official Adafruit hat
  steppers: [{ W1: 'M1', W2: 'M2' }]
}).init();

const doorMotor = motorHat.steppers[0];
doorMotor.setSteps(options.steps ? parseInt(options.steps) : 2048);
doorMotor.setCurrent(options.current ? parseFloat(options.current) : 0.6);
doorMotor.setSpeed({ rpm: (options.rpm ? parseInt(options.rpm) : 5) });

const distance = options.distance ? parseInt(options.distance) : 200;
doorMotor.step('fwd', distance, (err, result) => {
  if (err) return console.error(err);
  console.info(`Did ${result.steps} steps ${result.dir} in ${result.duration/1000} seconds with ${result.retried} retries.`);

  setTimeout(() => {
    doorMotor.step('back', distance, (err, result) => {
      if (err) return console.error(err);
      console.info(`Did ${result.steps} steps ${result.dir} in ${result.duration/1000} seconds with ${result.retried} retries.`);

      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });
  }, 5000);
});

exitHook(() => {
  doorMotor.releaseSync();
});

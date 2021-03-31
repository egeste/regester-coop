const { Command } = require('commander');
const package = require('./package.json');

const program = new Command();
program.version(package.version);

program.option('-r, --rpm <rpm>', 'set RPM (speed)');
program.option('-c, --current <current>', 'set current [ 0.0 - 1.0 ]');
program.option('-s, --steps <steps>', 'move this many steps');
program.parse(process.argv);
const options = program.opts();
console.log(options);

const MotorHat = require('motor-hat');
const motorHat = MotorHat({
  address: 0x60, // For the official Adafruit hat
  steppers: [{ W1: 'M1', W2: 'M2' }]
}).init();

const doorMotor = motorHat.steppers[0];
doorMotor.setSteps(options.steps || 2048);
doorMotor.setCurrent(options.current || 0.6);
doorMotor.setSpeed({ rpm: (options.rpm || 5) });

doorMotor.step('fwd', 200, (err, result) => {
  if (err) return console.log('Oh no, there was an error', err);

  console.log(`
    Did ${result.steps} steps ${result.dir} in ${result.duration/1000} seconds.
    I had to retry ${result.retried} steps because you set me up quicker than your poor board can handle.
  `);

  process.exit(0);
});

const exitHook = require('exit-hook');
exitHook(() => {
  doorMotor.releaseSync()
});

const MotorHat = require('motor-hat');
const exitHook = require('exit-hook');

const config = require('./config');
const doorState = require('./doorstate');

const motorHat = MotorHat({
  address: 0x60, // For the official Adafruit hat
  steppers: [{ W1: 'M1', W2: 'M2' }]
}).init();

const rpm = 5;
const steps = 2048;
const current = 0.8;
const doorMotor = motorHat.steppers[0];

doorMotor.setSteps(config.steps);
doorMotor.setCurrent(config.current);
doorMotor.setSpeed({ rpm: config.rpm });

const openDoor = () => {
  if (doorState.getIsOpen()) return Promise.resolve();
  if (doorState.getIsBlocked()) return Promise.reject('Door is blocked');

  return new Promise((resolve, reject) => {
    doorState.setIsBlocked();

    doorMotor.step('fwd', config.distance, (err, result) => {
      doorState.setIsBlocked(false);

      if (err) return reject(err);
      console.info(result);
      resolve(result);
    });
  });
};

const closeDoor = () => {
  if (!doorState.getIsOpen()) return Promise.resolve();
  if (doorState.getIsBlocked()) return Promise.reject('Door is blocked');

  return new Promise((resolve, reject) => {
    doorState.setIsBlocked();

    doorMotor.step('back', config.distance, (err, result) => {
      doorState.setIsBlocked(false);

      if (err) return reject(err);
      console.info(result);

      return doorMotor.release(err => {
        if (err) {
          console.error(err, 'Trying synchronously...');
          doorMotor.releaseSync();
        }

        resolve(result);
      });
    });
  });
};

const toggleDoor = open => {
  if (doorState.getIsBlocked()) return Promise.reject('Door is blocked');
  const shouldBeOpen = (open != null) ? Boolean(open) : !doorState.getIsOpen();
  return shouldBeOpen ? openDoor() : closeDoor();
}

module.exports = {
  rpm,
  steps,
  current,
  doorMotor,
  openDoor,
  closeDoor
};

exitHook(() => {
  doorMotor.releaseSync();
});

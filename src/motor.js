const MotorHat = require('motor-hat');
const exitHook = require('exit-hook');

const getConfig = require('./config');
const doorState = require('./doorstate');

const motorHat = MotorHat({
  address: 0x60, // For the official Adafruit hat
  steppers: [{ W1: 'M1', W2: 'M2' }]
}).init();

const [ doorMotor ] = motorHat.steppers;

const configureDoor = async () => {
  const { rpm, steps, current, frequency } = await getConfig();

  if (rpm) doorMotor.setSpeed({rpm});
  if (steps) doorMotor.setSteps(steps);
  if (current) doorMotor.setCurrent(current);
  if (frequency) doorMotor.setFrequencySync(frequency);
}

const openDoor = () => {
  if (doorState.getIsOpen()) return Promise.resolve();
  if (doorState.getIsBlocked()) return Promise.reject('Door is blocked');

  return new Promise(async (resolve, reject) => {
    doorState.setIsBlocked();

    await configureDoor();
    const config = await getConfig();
    const stepperDistance = (await storage.getItem('stepperDistance')) || config.distance;

    doorMotor.step('fwd', stepperDistance, (err, result) => {
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

  return new Promise(async (resolve, reject) => {
    doorState.setIsBlocked();

    await configureDoor();
    const config = await getConfig();
    const stepperDistance = (await storage.getItem('stepperDistance')) || config.distance;

    doorMotor.step('back', stepperDistance, (err, result) => {
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

module.exports = { doorMotor, openDoor, closeDoor }

exitHook(() => {
  doorMotor.releaseSync();
});

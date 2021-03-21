// const Alexa = require('ask-sdk-core');
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

// const LaunchRequestHandler = {
//   canHandle(handlerInput) {
//     return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
//   },
//   handle(handlerInput) {
//     return handlerInput.responseBuilder
//       .speak('Welcome to the Alexa Skills Kit, you can say hello!')
//       .reprompt('Welcome to the Alexa Skills Kit, you can say hello!')
//       .withSimpleCard('Hello World', 'Welcome to the Alexa Skills Kit, you can say hello!')
//       .getResponse();
//   }
// };
//
// const HelloWorldIntentHandler = {
//   canHandle(handlerInput) {
//     return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
//       && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
//   },
//   handle(handlerInput) {
//     const speechText = 'Hello World!';
//
//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .withSimpleCard('Hello World', speechText)
//       .getResponse();
//   }
// };
//
// const HelpIntentHandler = {
//   canHandle(handlerInput) {
//     return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
//       && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
//   },
//   handle(handlerInput) {
//     const speechText = 'You can say hello to me!';
//
//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .reprompt(speechText)
//       .withSimpleCard('Hello World', speechText)
//       .getResponse();
//   }
// };
//
// const CancelAndStopIntentHandler = {
//   canHandle(handlerInput) {
//     return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
//       && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
//         || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
//   },
//   handle(handlerInput) {
//     const speechText = 'Goodbye!';
//
//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .withSimpleCard('Hello World', speechText)
//       .withShouldEndSession(true)
//       .getResponse();
//   }
// };
//
// const SessionEndedRequestHandler = {
//   canHandle(handlerInput) {
//     return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
//   },
//   handle(handlerInput) {
//     //any cleanup logic goes here
//     return handlerInput.responseBuilder.getResponse();
//   }
// };
//
// const ErrorHandler = {
//   canHandle() {
//     return true;
//   },
//   handle(handlerInput, error) {
//     console.log(`Error handled: ${error.message}`);
//
//     return handlerInput.responseBuilder
//       .speak('Sorry, I can\'t understand the command. Please say again.')
//       .reprompt('Sorry, I can\'t understand the command. Please say again.')
//       .getResponse();
//   },
// };
//
// let skill;
// exports.handler = async function (event, context) {
//   console.log(`REQUEST++++${JSON.stringify(event)}`);
//   if (!skill) {
//     skill = Alexa.SkillBuilders.custom()
//       .addRequestHandlers(
//         LaunchRequestHandler,
//         HelloWorldIntentHandler,
//         HelpIntentHandler,
//         CancelAndStopIntentHandler,
//         SessionEndedRequestHandler,
//       )
//       .addErrorHandlers(ErrorHandler)
//       .create();
//   }
//
//   const response = await skill.invoke(event, context);
//   console.log(`RESPONSE++++${JSON.stringify(response)}`);
//
//   return response;
// };

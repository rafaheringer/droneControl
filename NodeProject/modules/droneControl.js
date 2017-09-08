//https://stackoverflow.com/questions/22156326/private-properties-in-javascript-es6-classes

let DroneControl = (()=>{
    //Private methods
    let _sendData;
    let _serialComm;
    let _setPPM;

    //Private properties
    const _PPMMin = 800; //Min rotation (1000)
    const _PPMMax = 2000; //Max rotation (2000)
    const _PPMMid = 1500; 

    let _PPMThrottle =  _PPMMin;
    let _PPMAileron =   _PPMMid;
    let _PPMElevator =  _PPMMid;
    let _PPMRudder =    _PPMMid;

    let _PPMThrottleEstable = 1200;

    let _executionQueue = [];

    class DroneControl {
        
        constructor(serialComm) {
            _serialComm = serialComm;
    
            _sendData = () =>  { 
                let line = '';

                line += _PPMThrottle + ',';
                line += _PPMAileron + ',';
                line += _PPMElevator + ',';
                line += _PPMRudder;

                _serialComm.sendData(line);
            }

            _setPPM = (type, ppm, timeToExecute, callback) => {
                let timerExpiration = 100;

                //Analysis the queue and de information to send data
                function sendPPM(type, ppm) {
                    //Have a queue to execute?
                    if(_executionQueue[type]) {
                        setTimeout(() => {
                            sendPPM(type, ppm);
                        }, timerExpiration);
                        
                        return;
                    }

                    //Verify ppm limits
                    ppm = ppm > _PPMMax ? _PPMMax : ppm < _PPMMin ? _PPMMin : ppm;

                    switch(type) {
                        case 'throttle':
                        _PPMThrottle = ppm;
                        break;
                        case 'aileron':
                        _PPMAileron = ppm;
                        break;
                        case 'elevator':
                        _PPMElevator = ppm;
                        break;
                        case 'rudder':
                        _PPMRudder = ppm;
                        break;
    
                        default:
                            console.error('DroneControl SetPPM: Type is not defined. TYPE:', type);
                        break;
                    }
    
                    //Send PPM to serial port
                    _sendData();
                }

                sendPPM(type, ppm);

                //Have a timing?
                if(timeToExecute) {
                    _executionQueue[type] ? _executionQueue[type]++ : _executionQueue[type] = 1;

                    setTimeout(() => {
                        _executionQueue[type]--;

                        if(typeof callback == 'function')
                            callback.call();
                    }, timeToExecute);
                } else {
                    if(typeof callback == 'function')
                        callback.call();
                }
            }
        }
    
        //Level up drone and hold them
        levelUp(forcePercentage, timeToExecute, callback) {
            goUp(forcePercentage, timeToExecute || 1000, () => {
                _setPPM('throttle', _PPMThrottleEstable, callback);
            });
        }
        
        //Level down drone and hold them
        levelDown(forcePercentage, timeToExecute, callback) {
            goDown(forcePercentage, timeToExecute || 1000, () => {
                _setPPM('throttle', _PPMThrottleEstable, callback);
            });
        }

        //Turnoff
        turnOff(callback) {
            _setPPM('throttle', 0, callback);
        }

        //Land
        land(callback) {
            levelDown(60, 6000, () => {
                turnOff(callback);
            });
        }

        //Up
        goUp(forcePercentage, timeToExecute, callback) {
            _setPPM('throttle', (forcePercentage * _PPMMax) / 100, timeToExecute, callback);
        }

        //Down
        goDown(forcePercentage, timeToExecute, callback) {
            //TODO: CALC!
            //_setPPM('throttle', _PPMMax - ((forcePercentage * _PPMMax) / 100), timeToExecute, callback);
        }

        //Go to left
        goLeft(forcePercentage, timeToExecute, callback) {
            _setPPM('aileron', _PPMMid + ((forcePercentage * (_PPMMax - _PPMMid)) / 100), timeToExecute, callback);
        }

        //Go to right
        goRight(forcePercentage, timeToExecute, callback) {
            //TODO: CALC!
            //_setPPM('aileron', //WHAT?, timeToExecute, callback);
        }

    }

    return DroneControl;
})();

exports.drone = DroneControl;
//https://stackoverflow.com/questions/22156326/private-properties-in-javascript-es6-classes

let DroneControl = (()=>{
    //Private methods
    let _sendData;
    let _serialComm;
    let _setPPM;

    //Private properties
    const _PPMMin = 100; //Min rotation (800 for original battery)
    const _PPMMax = 2000; //Max rotation (2000)
    const _PPMMid = 1500; 

    let _PPMThrottle =  _PPMMin;
    let _PPMAileron =   _PPMMid;
    let _PPMElevator =  _PPMMid;
    let _PPMRudder =    _PPMMid;

    let _PPMThrottleEstable = 400 //1200 for original battery;

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

            _setPPM = (type, ppm, callbackTime, callback) => {
                let timerExpiration = 100;

                //Analysis the queue and information to send data
                function sendPPM(type, ppm) {
                    //Have a queue to execute?
                    if(_executionQueue[type] > 0) {
                        setTimeout(() => {
                            sendPPM(type, ppm);
                        }, timerExpiration);
                        
                        return;
                    }

                    //Verify ppm limits
                    ppm = ppm > _PPMMax ? _PPMMax : ppm < _PPMMin ? _PPMMin : ppm;

                    switch(type) {
                        case 'forceThrottleDown':
                        _PPMThrottle = 0;
                        break;
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
                if(callbackTime) {
                    _executionQueue[type] ? _executionQueue[type]++ : _executionQueue[type] = 1;

                    setTimeout(function()  {
                        _executionQueue[type]--;

                        if(typeof callback == 'function')
                            callback.call();
                    }, callbackTime);
                } else {
                    if(typeof callback == 'function')
                        callback.call();
                }

                
            }
        }
    
        //Level up drone and hold them
        levelUp(callbackTime, callback) {
            this.setThrottle(50, callbackTime || 2000, function() {
                _setPPM('throttle', _PPMThrottleEstable, null, callback);
            })
        }
        
        //Level down drone and hold them
        levelDown(callbackTime, callback) {
            _setPPM('throttle', _PPMThrottleEstable, callbackTime || 1000, () => {
                _setPPM('throttle', _PPMMin, 3000, callback);
            })
        }

        //Turnoff
        turnOff(callback) {
            _setPPM('forceThrottleDown', null, null, callback);
        }

        //Land
        land(callback) {
            this.levelDown(2000, function() {
                this.turnOff(callback);
            }.bind(this));
        }

        //Up
        // goUp(forcePercentage, callbackTime, callback) {
        //     _setPPM('throttle', _PPMMid + (((_PPMMax - _PPMMid) * forcePercentage) / 100), callbackTime, callback);
        // }

        // //Down
        // goDown(forcePercentage, callbackTime, callback) {
        //     _setPPM('throttle',  _PPMMid - (((_PPMMid - _PPMMin) * forcePercentage) / 100), callbackTime, callback);
        // }

        //Throttle
        setThrottle(force, callbackTime, callback) {
            _setPPM('throttle', (force * (_PPMMax - _PPMMin) / 100 ) + _PPMMin, callbackTime, callback);
        }

        //Go to left
        goLeft(forcePercentage, callbackTime, callback) {
            _setPPM('aileron', _PPMMid - (((_PPMMid - _PPMMin) * forcePercentage) / 100), callbackTime, callback);
        }

        //Go to right
        goRight(forcePercentage, callbackTime, callback) {
            _setPPM('aileron', _PPMMid + (((_PPMMax - _PPMMid) * forcePercentage) / 100), callbackTime, callback);
        }

        goAhead(forcePercentage, callbackTime, callback) {
            _setPPM('elevator', _PPMMid + (((_PPMMax - _PPMMid) * forcePercentage) / 100), callbackTime, callback);
        }

        goBehind(forcePercentage, callbackTime, callback) {
            _setPPM('elevator',  _PPMMid - (((_PPMMid - _PPMMin) * forcePercentage) / 100), callbackTime, callback);
        }

    }

    return DroneControl;
})();

exports.drone = DroneControl;
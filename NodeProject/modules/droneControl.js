//https://stackoverflow.com/questions/22156326/private-properties-in-javascript-es6-classes

let DroneControl = (()=>{
    //Private methods
    let _sendData;
    let _serialComm;
    let _setPPM;

    //Private properties
    const _PPMMin = 500; //Min rotation (800 for original battery)
    const _PPMMax = 2000; //Max rotation (2000)
    const _PPMMid = 1500; 

    const _PPMThrottleMin = 0;
    const _PPMThrottleMax = 1000;

    let _PPMThrottle =  _PPMThrottleMin;
    let _PPMAileron =   _PPMMid;
    let _PPMElevator =  _PPMMid;
    let _PPMRudder =    _PPMMid;


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

            _setPPM = (type, ppm) => {
                //Verify ppm limits
                if(type != 'throttle')
                    ppm = ppm > _PPMMax ? _PPMMax : ppm < _PPMMin ? _PPMMin : ppm;
                else
                    ppm = ppm > _PPMThrottleMax ? _PPMThrottleMax : ppm < _PPMThrottleMin ? _PPMThrottleMin : ppm;

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
        }

        //Turnoff
        turnOff(callback) {
            _setPPM('throttle', 0);
        }
        
        //Throttle
        setThrottle(force) {
            _setPPM('throttle', (force * (_PPMThrottleMax - _PPMThrottleMin) / 100 ) + _PPMThrottleMin);
        }

        //Aileron
        setAileron(force) {
            //_setPPM('aileron', _PPMMid - (((_PPMMid - _PPMMin) * forcePercentage) / 100));
        }

        //Elevator
        setElevator(force) {
            // _setPPM('elevator', _PPMMid + (((_PPMMax - _PPMMid) * forcePercentage) / 100));
        }
    }

    return DroneControl;
})();

exports.drone = DroneControl;
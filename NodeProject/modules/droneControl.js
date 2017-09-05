//https://stackoverflow.com/questions/22156326/private-properties-in-javascript-es6-classes

let DroneControl = (()=>{
    let _sendData = new Symbol();
    let _serialComm = new Symbol();

    const _PPMMin = 1000; //Min rotation (1000)
    const _PPMMax = 2000; //Max rotation (2000)
    const _PPMMid = 1500; 

    let _PPMThrottle;
    let _PPMAileron;
    let _PPMElevator;
    let _PPMRudder;

    class DroneControl {
        
        constructor(serialComm) {
            _serialComm = serialComm;
    
            _sendData = (line) =>  { 
                _serialComm.sendData(line);
            }
        }
    
        connect() {
    
        }
    
        levelUp(ammount, velocity) {
    
        }
    
        levelDown(ammount, velocity) {
    
        }
    }

    return DroneControl;
})();

exports.drone = DroneControl;
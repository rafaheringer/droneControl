class DroneControl {

    constructor(serialComm) {
        this.serialComm = serialComm;

        this.sendData = function(line) { 
            this.serialComm.sendData(line);
        }
    }

    connect() {

    }

    levelUp(ammount, velocity) {

    }

    levelDown(ammount, velocity) {

    }
}

exports.drone = DroneControl;
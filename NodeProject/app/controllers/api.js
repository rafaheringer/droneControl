var express = require('express'),
    serialComm = require('../../modules/serialComm'),
    bodyParser = require('body-parser'),
    router = express.Router();

module.exports = app => {
    app.use('/', router);
};

router.get('/api/serial/getPorts', (req, res, next) => {
    serialComm.getAvailableSerialPorts((error, result) => {
        res.json(result);
    });
});

router.route('/api/serial/connect').post((req, res, next) => {
    try {
        serialComm.connect(req.body.name);
        res.status(200);
    } catch(ex) {
        res.status(500).json({message: 'Error on connect to the serial port.'});
    }
});
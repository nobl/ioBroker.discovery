'use strict';

const tools = require('../tools.js');

function addInstance(ip, device, options, native, callback) {
    let instance = tools.findInstance(options, 'senec', obj => obj.native.senecip === ip || obj.native.senecip === device._name);

    if (!instance) {
        instance = {
            _id: tools.getNextInstanceID('senec', options),
            common: {
                name: 'senec',
                title: 'senec (' + ip + (device._name ? (' - ' + device._name) : '') + ')'
            },
            native: {
				senecip: ip
			},
            comment: {
                add: [ip]
            }
        };
        options.newInstances.push(instance);
        callback(null, true, ip);
    } else {
        callback(null, false, ip);
    }
}

function detect(ip, device, options, callback) {
    tools.httpGet('http://' + ip, (err, data) => {
        if (err || !data) {
            callback && callback(null, false, ip);
            callback = null;
        } else if (data) {
            let testData;
            try {
                testData = JSON.stringify(data);
            } catch (e) {
                testData = null;
            }

            if (testData && data.includes('SENEC')) {
                addInstance(ip, device, options, {
                    ip
                }, callback);
            } else {
                callback && callback(null, false, ip);
                callback = null;
            }
        } else {
            callback && callback(null, false, ip);
            callback = null;
        }
    });
}

exports.detect = detect;
exports.type = ['ip'];
exports.timeout = 1500;

/*
 * InsureTech Hackathon London
 * date: 2016-02-27
 */

var PUBLISHING_INTERVAL = 2000;
var DEVICE_ID = "452411b1-6b68-4fa6-b9f2-7c5d0b7b7c2d";
var mqtt = require('mqtt');
var mraa = require('mraa');



var temperatureSensor   = new mraa.Aio(0);
var vibrationSensor     = new mraa.Aio(1);
temperatureSensor.setBit(10);
vibrationSensor.setBit(10);


var client = mqtt.connect({
    servers:[{'host':'mqtt.relayr.io'}],
    username: DEVICE_ID,
    password: "C4a4C4UWYtPj",
    clientId: "TRSQRsWtoT6a58nxdC3t8LQ",
    protocol : 'mqtt',
    rejectUnauthorized : false,
});


client.on('connect', function() {

    //subscribe to commands sent from the dashboard or other clients
    client.subscribe("/v1/" + DEVICE_ID +"/cmd");

    client.on('message', function (topic, message) {
        console.log(message.toString());
    });


    //simple timer to send a message every 'x' second
    var publisher = setInterval(function(){


        var rawTemperature = temperatureSensor.read();
        var rawVibration = vibrationSensor.read();
        console.log("temperature: " + rawTemperature);
        console.log("vibration: " + rawVibration);
        console.log("\n");

        // publish a message to a topic
        var data = JSON.stringify([{meaning:"temperature", value: rawTemperature}, {meaning:"vibration", value: rawVibration}]);

        console.log("json: " + data);

        client.publish("/v1/" + DEVICE_ID + "/data", data, function() {
            //console.log("Message is published");
        });

    }, PUBLISHING_INTERVAL);
});


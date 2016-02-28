/*
 * InsureTech Hackathon London
 * date: 2016-02-27
 */

var PUBLISHING_INTERVAL = 2000;
var DEVICE_ID = "452411b1-6b68-4fa6-b9f2-7c5d0b7b7c2d";
var mqtt = require('mqtt');
var mraa = require('mraa');

var B = 3975;

var temperatureSensor   = new mraa.Aio(0);
var vibrationSensor     = new mraa.Aio(1);
temperatureSensor.setBit(10);
vibrationSensor.setBit(10);

var digitalAccelerometer = require('jsupm_mma7660');

// Instantiate an MMA7660 on I2C bus 0
var myDigitalAccelerometer = new digitalAccelerometer.MMA7660(
    digitalAccelerometer.MMA7660_I2C_BUS,
    digitalAccelerometer.MMA7660_DEFAULT_I2C_ADDR);

// place device in standby mode so we can write registers
myDigitalAccelerometer.setModeStandby();

// enable 64 samples per second
myDigitalAccelerometer.setSampleRate(digitalAccelerometer.MMA7660.AUTOSLEEP_64);

// place device into active mode
myDigitalAccelerometer.setModeActive();

var x, y, z;
x = digitalAccelerometer.new_intp();
y = digitalAccelerometer.new_intp();
z = digitalAccelerometer.new_intp();

var ax, ay, az;
ax = digitalAccelerometer.new_floatp();
ay = digitalAccelerometer.new_floatp();
az = digitalAccelerometer.new_floatp();

var outputStr;


// round off output to match C example, which has 6 decimal places
function roundNum(num, decimalPlaces)
{
    var extraNum = (1 / (Math.pow(10, decimalPlaces) * 1000));
    return (Math.round((num + extraNum)
        * (Math.pow(10, decimalPlaces))) / Math.pow(10, decimalPlaces));
}



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
        var resistance = (1023 - rawTemperature) * 10000 / rawTemperature; //get the resistance of the sensor;
        //console.log("Resistance: "+resistance);
        var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via da


        var rawVibration = vibrationSensor.read();
        console.log("temperature: " + celsius_temperature);
        console.log("vibration: " + rawVibration);
        console.log("\n");



        // data from accelerometer
        //myDigitalAccelerometer.getRawValues(x, y, z);
        //outputStr = "Raw values: x = " + digitalAccelerometer.intp_value(x) +
        //    " y = " + digitalAccelerometer.intp_value(y) +
        //    " z = " + digitalAccelerometer.intp_value(z);
        //console.log(outputStr);

        myDigitalAccelerometer.getAcceleration(ax, ay, az);
        //outputStr = "Acceleration: x = "
        //    + roundNum(digitalAccelerometer.floatp_value(ax), 6)
        //    + "g y = " + roundNum(digitalAccelerometer.floatp_value(ay), 6)
        //    + "g z = " + roundNum(digitalAccelerometer.floatp_value(az), 6) + "g";
        //console.log(outputStr);
        var accX = roundNum( digitalAccelerometer.floatp_value(ax), 4 );
        var accY = roundNum( digitalAccelerometer.floatp_value(ay), 4 );
        var accZ = roundNum( digitalAccelerometer.floatp_value(az), 4 );

        // publish a message to a topic
        var data = JSON.stringify([
            {meaning:"temperature", value: celsius_temperature},
            {meaning:"vibration", value: rawVibration},
            {meaning:"acceleration", value: "" + accX + " " + accY + " " +  accZ}
        ]);

        console.log("json: " + data);

        client.publish("/v1/" + DEVICE_ID + "/data", data, function() {
            //console.log("Message is published");
        });

    }, PUBLISHING_INTERVAL);
});




// When exiting: clear interval and print message
process.on('SIGINT', function()
{
    //clearInterval(myInterval);

    // clean up memory
    digitalAccelerometer.delete_intp(x);
    digitalAccelerometer.delete_intp(y);
    digitalAccelerometer.delete_intp(z);

    digitalAccelerometer.delete_floatp(ax);
    digitalAccelerometer.delete_floatp(ay);
    digitalAccelerometer.delete_floatp(az);

    myDigitalAccelerometer.setModeStandby();

    console.log("Exiting...");
    process.exit(0);
});

/*
 * measures:
 *  pressure
 *  accelerator/gyro
 *  humidity
 *  temperature
 * 
 * output: JSON
 *  
 */
#define SAMPLING_INTERVAL 1000

#include <Wire.h>
#include <Arduino.h>

#include <HTS221.h>
#include <LPS25H.h>
#include <LSM9DS1.h>


char strBuf[32];

void setup() {
    //Initiate the Wire library and join the I2C bus
    Wire.begin();

    smePressure.begin();
    smeHumidity.begin();
    smeAccelerometer.begin();
    smeGyroscope.begin();
    SerialUSB.begin(115200);
}



void loop() {


    if (SerialUSB.available() > 0 && SerialUSB.read() == 'u') {
      ledGreenLight(HIGH);
      delay(500);
      
      
  
      // put your main code here, to run repeatedly:
      
  
      String resultString = String("");
  
      /* HUMIDITY */
      int humidityData = smeHumidity.readHumidity();
      String humidity = String(humidityData);
      //resultString.concat( String("\"humidity\":") );
      resultString.concat( humidity );
      
          
  
      /* TEMPERATURE */
      int data = 0;
      data = smeHumidity.readTemperature();
      String temperature = String(data);
      //resultString.concat(",\"temperature\":");
      resultString.concat("," + temperature);
      
      
  
      /* PRESSURE */
      data = smePressure.readPressure();
      String pressure = String(data);
      //resultString.concat(",\"pressure\":");
      resultString.concat("," + pressure);
  
      
  
      /* ACCELEROMETER */
      //double ax = 0;
      //double ay = 0;
      //double az = 0;
  
     // String ax = String(smeAccelerometer.readX(), 3);
      //String ay = String(smeAccelerometer.readY(), 3);
      //String az = String(smeAccelerometer.readZ(), 3);
     
  
      //resultString.concat("," + ax);
      //resultString.concat("," + ay);
      //resultString.concat("," + az);
  
  
      
      //resultString.concat(ax);
      //resultString.concat(",\"accelY\":" + sy);
      //resultString.concat(",\"accelZ\":" + sz);
  
      //resultString.concat("\n\0");
      SerialUSB.println(resultString);
      
      /*  GYROSCOPE */
      //ax = smeGyroscope.readX();
      //ay = smeGyroscope.readY();
      //az = smeGyroscope.readZ();

      ledGreenLight(LOW);
      delay(500);

      
    }

    delay(SAMPLING_INTERVAL);  

}

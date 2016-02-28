#!/usr/bin/env python                                                                                                                                                                                                                         

# Description:
#  Script che legge le informazioni provenienti da un dispositivo (arduino nano), 
#   che e' usato per dimostrare la connettivita' ad altri sistemi. (IOT)
#
#

import serial
import json
import time
import paho.mqtt.client as mqtt


# serial communication with arduino
ser = serial.Serial(
    '/dev/ttyACM0',
    baudrate=115200,
    bytesize=serial.EIGHTBITS,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    timeout=5,
    xonxoff=0,
    rtscts=0
)






# mqtt credentials
creds = {
    'clientId': 'T7CDG7y3rSH6gm5Y+whR/yQ',
    'user':     'ec20c6ef-2deb-487e-a09b-963ec2147fc9',
    'password': '6MLoX3xEQ.AI',
    'topic':    '/v1/ec20c6ef-2deb-487e-a09b-963ec2147fc9/',
    'server':   'mqtt.relayr.io',
    'port':     1883
}


# ATTENTION !!!
# DO NOT try to set values under 200 ms of the server
# will kick you out
publishing_period = 1500


class MqttDelegate(object):
    "A delegate class providing callbacks for an MQTT client."

    def __init__(self, client, credentials):
        self.client = client
        self.credentials = credentials

    def on_connect(self, client, userdata, flags, rc):
        print('Connected.')
        # self.client.subscribe(self.credentials['topic'].encode('utf-8'))
        self.client.subscribe(self.credentials['topic'] + 'cmd')
    
    def on_message(self, client, userdata, msg):
        print('Command received: %s' % msg.payload)
    
    def on_publish(self, client, userdata, mid):
        print('Message published.')


def main(credentials, publishing_period):
    client = mqtt.Client(client_id=credentials['clientId'])
    delegate = MqttDelegate(client, creds)
    client.on_connect = delegate.on_connect
    client.on_message = delegate.on_message
    client.on_publish = delegate.on_publish
    user, password = credentials['user'], credentials['password']
    client.username_pw_set(user, password)
    # client.tls_set(cafile)
    # client.tls_insecure_set(False)
    try:
        print('Connecting to mqtt server.')
        server, port = credentials['server'], credentials['port']
        client.connect(server, port=port, keepalive=60)
    except:
        print('Connection failed, check your credentials!')
        return
    
    # set 200 ms as minimum publishing period
    if publishing_period < 200:
        publishing_period = 200

    while True:
        client.loop()


        # send the update character
        ser.write('u'.encode('utf-8'))
        ser.flush()     

        values = [int(v) for v in ser.readline().strip().split(',')]
        if len(values) == 3:
            #// send the data
            print(values)

            # publish data
            message = [
                {
                    'meaning': 'humidity',
                    'value': values[0]
                },
                {
                    'meaning': 'temperature',
                    'value': values[1]

                },
                {
                    'meaning': 'pressure',
                    'value': values[2]

                }
                ]
            client.publish(credentials['topic'] +'data', json.dumps(message))

        time.sleep(publishing_period / 1000.)


if __name__ == '__main__':
    main(creds, publishing_period)

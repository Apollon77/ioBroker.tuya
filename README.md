![Logo](admin/tuya.png)
# ioBroker.tuya

[![Greenkeeper badge](https://badges.greenkeeper.io/Apollon77/ioBroker.tuya.svg)](https://greenkeeper.io/)

[![NPM version](http://img.shields.io/npm/v/iobroker.tuya.svg)](https://www.npmjs.com/package/iobroker.tuya)
[![Downloads](https://img.shields.io/npm/dm/iobroker.tuya.svg)](https://www.npmjs.com/package/iobroker.tuya)
[![Dependency Status](https://gemnasium.com/badges/github.com/Apollon77/ioBroker.tuya.svg)](https://gemnasium.com/github.com/Apollon77/ioBroker.tuya)
[![Maintainability](https://api.codeclimate.com/v1/badges/ccc74a3ef8de69265ca1/maintainability)](https://codeclimate.com/github/Apollon77/ioBroker.tuya/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ccc74a3ef8de69265ca1/test_coverage)](https://codeclimate.com/github/Apollon77/ioBroker.tuya/test_coverage)

**Tests:** Linux/Mac/Windows: [![Travis-CI](http://img.shields.io/travis/Apollon77/ioBroker.tuya/master.svg)](https://travis-ci.org/Apollon77/ioBroker.tuya)
Windows: [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/Apollon77/ioBroker.tuya?branch=master&svg=true)](https://ci.appveyor.com/project/Apollon77/ioBroker-daikin/)

[![NPM](https://nodei.co/npm/iobroker.tuya.png?downloads=true)](https://nodei.co/npm/iobroker.tuya/)

ioBroker adapter to connect to several small and cheap Wifi devices that care connected to the Tuya Cloud and mostly use the Smartlife App/Alexa-Skill. The adapter supports reading real time status updates and controlling of those devices once synced with the respective mobile phone app.

Tuya devices are ESP8266MOD WiFi smart devices from Shenzhen Xenon.

Beside devices usable with the Smart Live App the use of the Jinvoo Smart App, Xenon Smart app, eFamilyCloud app should also be possible. Please report back if successfull.

## How the adapter works

### Basic functionality

The adapter monitors the local network for UDP packets of Tuya devices. It is needed that the ioBroker host where the adapter runs on is placed in the same network segment as the devices and UDP multicasting needs to be supported by the router!

All detected devices are added to the adapter and as basis functionality the adapter requests data in the defined polling interval. Without a sync with the respective mobile app (see below) NO further functionality like real time updates or controlling is possible.

### Advanced functionality after device sync

To get the full functionality of the adapter  an encryption key needs to be known by the adapter.

The easiest way to receive this encryption key is to get them from the used mobile app. To do this the adapter provides a proxy to catch the communication of the app with the tuya servers and grab the needed information.

To do this first of all you need to add a custom Root-Certificate on your mobile device.
When you click "Start Proxy" in the adapter instance configuration the certificate is created for your system and shows a QR-Code to the download location. Ideally scan the QR Code with your mobile device and follow the process to add and trust this Root-Certificate.
If the QR code location is not reachable (may happen when use Docker or such) then open the "Proxy Web Info Port" in your browser and click on "Root-CA" in the navigation and you can download the CA File too.

Now make sure to close/kill the respective Tuya smart app.
After that add the Proxy-Port and the ioBroker host as "Manual" Proxy for your WLAN connection on your mobile phone.

Now open the respective Tuya Smart App and/or reload.

The Admin configuration will show a success message if the relevant data packet was received and will then turn the proxy off 10 seconds later. You can now remove the proxy from your phone and also untrust the certificate.

Directly after this the objects should be updated with more meaningful names and receive live updates from then on automatically and should be able to communicate.

The sync is only needed initially or after you added new devices to your App.

## Credits
The work of the adapter would not had been possible without the great work of @codetheweb and @NortherMan54 (https://github.com/codetheweb/tuyapi) and https://github.com/clach04/python-tuya and many more.

## Todo
* enhance testing: state checks and setState's
* enhance documentation

## Changelog

### 0.1.x
* development and first tests

## License

The MIT License (MIT)

Copyright (c) 2018 Apollon77 <iobroker@fischer-ka.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

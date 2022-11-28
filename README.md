![Logo](admin/tuya.png)
# ioBroker.tuya

![Number of Installations](http://iobroker.live/badges/tuya-installed.svg)
![Number of Installations](http://iobroker.live/badges/tuya-stable.svg)
[![NPM version](http://img.shields.io/npm/v/iobroker.tuya.svg)](https://www.npmjs.com/package/iobroker.tuya)

![Test and Release](https://github.com/Apollon77/iobroker.tuya/workflows/Test%20and%20Release/badge.svg)
[![Translation status](https://weblate.iobroker.net/widgets/adapters/-/tuya/svg-badge.svg)](https://weblate.iobroker.net/engage/adapters/?utm_source=widget)
[![Downloads](https://img.shields.io/npm/dm/iobroker.tuya.svg)](https://www.npmjs.com/package/iobroker.tuya)

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

ioBroker adapter to connect to several small and cheap Wifi devices that care connected to the Tuya Cloud and mostly use the Smartlife App/Alexa-Skill. The adapter supports reading real time status updates and controlling of those devices once synced with the respective mobile phone app.

Tuya devices are ESP8266MOD WiFi smart devices from Shenzhen Xenon.

Beside devices usable with the Smart Live App or Tuya App.

The adapter locally connects to all devices that are "always in wifi". Devices that only come online when there is an event, send their data and go offline again (mostly **battery powered devices**) are only supported using the Tuya IoT Platform MQTT connection (see below).

One adapter instance can locally discover and connect to all devices in a network that routes UDP packages! For Docker environments this requires additional actions and potentially Macvlan or similar!

## Disclaimer
**All product and company names or logos are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them or any associated subsidiaries! This personal project is maintained in spare time and has no business goal.**
**TUYA is a trademark of Tuya Global Inc.**

## Functionality: Local-only vs Cloud Supported Features

This adapter can, if wanted, mostly work without the Tuya Cloud. 

If this is wanted a one time synchronization with the Tuya Cloud App Account is needed as soon as new devices are added. This can be done be entering the cloud credentials in the adapter config and clock the "synchronize one time" button. It is not needed to store the cloud credentials!

**Note: When the App Sync is done it might be that the Tuya Mobile app informs about a login from an Android device into the Tuya Account. This is from the Adapter!**

The adapter then will listen for local UDP messages to find the local IPs of the devices and establish a local connection. This is only possible when the Tuya App is NOT open on any device because most devices only allow one local connection.

If you decide to store your Tuya App Login Credentials (Smart Life App or Tuya Smart App) in the adapter configuration then the devices are updated with each adapter start automatically. Additionally the states of devices that are not connected locally can be polled and controlled via the Tuya Cloud.

To support real time updates of devices that are not connected locally, and also e.g. battery based devices, you can additionally register yourself an Account on the Tuya IoT Platform and Link your App Account and use a Cloud-MQTT connection. To register yourself an Account on the Tuya IoT Platform please follow the instructions on [Tuya IoT Platform](https://developer.tuya.com/en/docs/iot/Platform_Configuration_smarthome?id=Kamcgamwoevrx).
**Note: The IoT Platform Account is only active for some time and needs to be extended monthly afterwards!**

With this featureset you can choose between all available options and work with or (beside the one time syncs) without the Tuya Cloud systems. You decide.

The "former" App-Proxy-Sync is still available in the Adapter Config but not recommended anymore. It is much easier to do the new One Time Cloud Sync.

### If UDP discovery do not work
If the devices are not correctly detected via their UDP packages you can set the IP manually by setting the ip state of the device to the correct IP.
The former alternative is to edit the device object. See https://github.com/Apollon77/ioBroker.tuya/issues/221#issuecomment-702392636

### Note for Battery powered devices
As already told above Battery powered devices are not supported by this adapter when using only local connections! The reason is that they are not online all the time to save power. Whenever they get a signal, they go online, send the update to the the Tuya cloud servers and go offline again. They do not emit any UDP packages or are online long enough so that the adapter could connect to them.

By using the Tuya App Cloud feature data can be polled, but this might be still not enough for door/window/presence detectors. They should work only with the Tuya IoT Platform MQTT connection.

## Proxy-Sync (Fallback): Compatible Mobile Apps and versions
The currently versions of the Tuya Smart and also Smartlife App are **no longer compatible** with the way the adapter works because Tuya encrypted all traffic that the adapter could sniff. For now still some older versions of the Apps work ...

* Smartlife App <3.14, best 3.12.6!!
* Tuya Smart App <3.14, best 3.12.x
* STL Smart Home App 1.1.1 (last dated Sept 2019)
* Ucomen Home App (??)

**Important Note for iOS Users:** The Proxy approach described here is not working anymore. As soon as you have Smart Life App version 3.10 or higher the communication from App is no longer visible to the proxy. But it still works with all Android App versions, so the best approach is an Androis Emulator as roughly described at https://forum.iobroker.net/topic/23431/aufruf-tuya-adapter-tests-verschl%C3%BCsselte-ger%C3%A4te/19

To do this first of all you need to add a custom Root-Certificate on your mobile device.
When you click "Start Proxy" in the adapter instance configuration the certificate is created for your system and shows a QR-Code to the download location. Ideally scan the QR Code with your mobile device and follow the process to add and trust this Root-Certificate.
If the QR code location is not reachable (may happen when use Docker or such) then open the "Proxy Web Info Port" in your browser and click on "Root-CA" in the navigation and you can download the CA File too.

Now make sure to close/kill the respective Tuya smart app.
After that add the Proxy-Port and the ioBroker host as "Manual" Proxy for your WLAN connection on your mobile phone.

Now open the respective Tuya Smart App and/or reload.

The Admin configuration will show a success message if the relevant data packet was received and will then turn the proxy off 10 seconds later. You can now remove the proxy from your phone and also untrust the certificate.

Directly after this the objects should be updated with more meaningful names and receive live updates from then on automatically and should be able to communicate.

The sync is only needed initially or after you added new devices to your App.

Some images for some mobile OS can be found at the [Proxy-Page](PROXY.md).

## Infrared Gateway features
There are different types of IR devices in the object tree

### The IR Gateway/Sender Devices
This is the real device you have as Hardware. This device is used by sub devices defined in the mobile App (see below) and can be used to learn and send custom IR codes.

The "ir-learn" state in this device is a Trigger which can be used to learn IR codes. The learned code is then received in the "202" state as base64 encoded Data.

The "ir-send" state can be used to send a base64 encoded IR code to the device. This can be used to send the learned code from the "ir-learn" state.

**This way to control only works on the "main IR device" and only when connected locally (no cloud connection) (right now).**

### The IR Sub Devices
The IR sub devices have a lot of "ir-*" states wich are all buttons to trigger the respective Button/IR code. The ir states should match the layout of the buttons in the mobile App.

Some devices have combi-states like "M0_T20_S3" (found by a Daikin Air conditioner) which means Mode 0, Temperature 20 and (Fan)-Speed 3. In fact you need to choose the right button. Until now we did not found a generic/automated way to find out which button is which.
The mobile App itself also tries to remember these settings, so as soon you trigger anything with the adapter (or the real ir controller of the device) the information from the App is outdated.

**This way to control only works whenapp cloud credentials are entere. The commands will be send also out via cloud for now.**

## Scenes features
When the app cloud credentials are entered and stored then the adapter also reads out the scenes from the app and creates them as objects in the adapter. The scenes can be triggered by setting the scene state to true.

The triggering is then send to the cloud.

## Groups features
The adapter also reads out defined groups and creates corresponding states in the adapter. The group value is also polled from cloud and updated in the adapter.
When controlling groups the adapter tries to use an existing local connection to the device with cloud as fallback.

## Credits
The work of the adapter would not had been possible without the great work of @codetheweb, @kueblc and @NorthernMan54 (https://github.com/codetheweb/tuyapi) and https://github.com/clach04/python-tuya,https://github.com/uzlonewolf/tinytuya and many more.

## How to report issues and feature requests

Please use GitHub issues for this.

Best is to set the adapter to Debug log mode (Instances -> Expert mode -> Column Log level). Then please get the logfile from disk (subdirectory "log" in ioBroker installation directory and not from Admin because Admin cuts the lines). If you do not like providing it in GitHub issue you can also send it to me via email (iobroker@fischer-ka.de). Please add a reference to the relevant GitHub issue AND also describe what I see in the log at which time.

When there are issues with the Tuya App Cloud synchronisation then additional logging can be generatedf by the following process:
* Stop the adapter in Admin
* Open a shell on the ioBroker host
* execute `DEBUG=@tuyapi/cloud* iobroker debug tuya`
* get the log from the command line
Send the log with reference to the generated GitHub issue to iobroker@fischer-ka.de

## Changelog

### __WORK IN PROGRESS__
* (Apollon77) Added support for groups
* (Apollon77) Add support for an other type of IR blaster
* (Apollon77) Added cloud session refresh while adapter is running
* (Apollon77) Add custom handling for bright_value fields with missing scale factor (10..1000 will be now 1..100);
* (Apollon77) Base64 encoded raw values are now decoded again when the decoded value is readable ascii
* (Apollon77) More schema information added/updated

### 3.9.4 (2022-11-19)
* (Apollon77) More schema information added/updated

### 3.9.3 (2022-11-17)
* (Apollon77) Optimize Tuya protocol 3.4 discovery
* (Apollon77) Prevent restart schedules that are too short when cloud is used
* (Apollon77) Fix crash cases reported by Sentry
* (Apollon77) More schema information added/updated

### 3.9.2 (2022-11-16)
* (Apollon77) Optimize discovery and device connection checks
* (Apollon77) IPs of unconnected devices can be set via the ip state now
* (Apollon77) Fix crash cases reported by Sentry

### 3.9.1 (2022-11-14)
* (Apollon77) Add support for local control of Tuya protocols 3.2 and 3.4
* (TA2k/Apollon77) Add basic support for IR devices (Gateway and Sub Devices)
* (Apollon77) Convert special colour/colour_data values to an additional rgb state
* (Apollon77) Allow to define that devices do not connect locally (this prevents error logs, and they work via cloud if data are provided)
* (Apollon77) Add support for more cloud MQTT notifications
* (Apollon77) More schema information added/updated

### 3.8.1 (2022-11-06)
* (TA2k/Apollon77) Add App-Cloud Sync deceasing the proxy
* (Apollon77) Add support for device polling using App-Cloud for devices not connected
* (Apollon77) Add support for realtime cloud state updates using Tuya IoT Platform MQTT connection
* (Apollon77) Allow to update names of device objects when changed in App
* (Apollon77) Use read Schema details from Sync instead the already contained ones
* (Apollon77) React to device infos from MQTT connection and update/add device objects
* (Apollon77) When Datapoints (e.g sockets) have custom names, also use them as State Names
* (Apollon77) More schema information added

### 3.7.2 (2022-10-23)
* (Apollon77) Prevent warnings for invalid min/max values

### 3.7.0 (2022-10-22)
* (Apollon77) Optimizations for Proxy mode to prevent certificate issues
* (Apollon77) Allow to also "click" on the certificate to download the certificate file
* (Apollon77) Adjust min/max values if a scale is defined
* (Apollon77) More schema information added

### 3.6.15 (2022-01-24)
* (Apollon77) More schema information added
* (Apollon77) Recreate Proxy SSL certificates once older than 3 months to prevent ssl errors

### 3.6.14 (2021-11-07)
* (Apollon77) More schema information added

### 3.6.13 (2021-10-28)
* (Apollon77) More schema information added

### 3.6.11 (2021-09-05)
* (Apollon77) More schema information added

### 3.6.9 (2021-07-18)
* (Apollon77) Adjust reconnect handling on initialization

### 3.6.8 (2021-07-18)
* (Apollon77) Another fix on reconnect handling

### 3.6.7 (2021-07-18)
* (Apollon77) Another fix on reconnect handling

### 3.6.6 (2021-07-17)
* (Apollon77) Fix reconnect handling
* (Apollon77) More schema information added

### 3.6.5 (2021-06-23)
* (Apollon77) Make sure for enums values are set with correct type
* (Apollon77) More schema information added

### 3.6.3 (2021-06-04)
* (Apollon77) More schema information added
* (Apollon77) Update tuyapi

### 3.6.2 (2021-05-10)
* (Apollon77) type "bitmap" is a number
* (Apollon77) More schema information added

### 3.6.1 (2021-04-11)
* (Apollon77) More schema information added

### 3.6.0 (2021-04-02)
* (Apollon77) Fix broken data updates because of tuyaapi change
* (Apollon77) Optimize "json unvalid" cases by refreshing data manually differently 
* (Apollon77) More schema information added

### 3.5.9 (2021-03-28)
* (Apollon77) More schema information added

### 3.5.8 (2021-03-24)
* (Apollon77) More schema information added

### 3.5.7 (2021-03-18)
* (Apollon77) Fix crash case (Sentry IOBROKER-TUYA-P9)
* (Apollon77) More schema information added

### 3.5.6 (2021-02-09)
* (Apollon77) More schema information added

### 3.5.4 (2021-01-30)
* (Apollon77) Prevent crash cases (Sentry IOBROKER-TUYA-MG)
* (Apollon77) More schema information added

### 3.5.3 (2021-01-13)
* (Apollon77) More schema information added

### 3.5.2 (2020-12-24)
* (Apollon77) More schema information added

### 3.5.0 (2020-12-10)
* (Apollon77) More schema information added
* (Apollon77) Try to decode "raw" values via base64

### 3.4.3 (2020-11-29)
* (Apollon77) More schema information added

### 3.4.2 (2020-11-19)
* (Apollon77) More schema information added

### 3.4.1 (2020-11-05)
* (Apollon77) More schema information added
* (Apollon77) fix IP lookup via UDP

### 3.4.0 (2020-10-29)
* (Apollon77) update tuya-api library

### 3.3.15 (2020-10-29)
* (Apollon77) More schema information added

### 3.3.14 (2020-09-15)
* (Apollon77) More schema information added

### 3.3.12 (2020-08-26)
* (Apollon77) More schema information added
* (Apollon77) Crash case prevented (Sentry IOBROKER-TUYA-89)

### 3.3.11 (2020-08-18)
* (Apollon77) More schema information added

### 3.3.10 (2020-08-02)
* (Apollon77) More schema information added

### 3.3.9 (2020-07-16)
* (Apollon77) More schema information added

### 3.3.8 (2020-07-09)
* (Apollon77) Work around invalid data that are returned by some devices
* (Apollon77) More schema information added

### 3.3.7 (2020-07-01)
* (Apollon77) More schema information added

### 3.3.6 (2020-06-29)
* (Apollon77) More schema information added

### 3.3.5 (2020-06-11)
* (Apollon77) More schema information added
* (Apollon77) Optimizations and fixes

### 3.3.2 (2020-03-19)
* (Apollon77) Many new schemas added

### 3.2.3 (2020-03-08)
* (Apollon77) Many new schemas added

### 3.2.2 (2020-02-08)
* (Apollon77) New schemas added
* (Apollon77) Better handle strange case where qrcode library is not existing

### 3.2.0 (2020-02-05)
* (Apollon77) Many new schemas added
* (Apollon77) Add Infos about compatible App versions with link to enhanced docs
* (Apollon77) try to detect unsupported apps when trying to sync and write warning in logfile
* (Apollon77) Switch Sentry to iobroker own instance hosted in germany

### 3.1.16 (2019-12-26)
* (Apollon77) New schemas added
* (Apollon77) prevent crash when proxy request had no hosts array

### 3.1.15 (2019-12-24)
* (Apollon77) New schemas added
* (Apollon77) prevent usage of invalid Port numbers

### 3.1.14 (2019-12-20)
* (Apollon77) New schemas added
* (Apollon77) prevent usage of invalid Port numbers

### 3.1.13 (2019-12-11)
* (Apollon77) New schemas added

### 3.1.12 (2019-12-07)
* (Apollon77) New schemas added
* (Apollon77) Dependency update

### 3.1.11 (2019-12-06)
* (Apollon77) New schemas added
* (Apollon77) Dependency update

### 3.1.10 (2019-12-05)
* (Apollon77) New schemas added

### 3.1.9 (2019-11-30)
* (Apollon77) New schemas added
* (Apollon77) Improve error handling for proxy web port

### 3.1.8 (2019-11-28)
* (Apollon77) New schemas added
* (Apollon77) Add check for invalid proxy port

### 3.1.7 (2019-11-26)
* (Apollon77) New schemas added

### 3.1.6 (2019-11-25)
* (Apollon77) New schemas added
* (Apollon77) Optimize Sentry integration and dedupe errors

### 3.1.4 (2019-11-24)
* (Apollon77) New schemas added

### 3.1.3 (2019-11-24)
* (Apollon77) try to get rid of SSL errors with new proxies
* (Apollon77) Many new schemas added
* (Apollon77) Sentry added for error/exception/schema reporting
* (Apollon77) Compact Mode added

### 3.0.0 (2019-09-03)
* (Apollon77) Switch from AnyProxy to mitm ... hopefully get SSL-Proxy working again. Important: The Proxy is called "NodeMITMProxyCA"!

### 2.0.4 (2019-08-01)
* (Apollon77) New schemas added
* (Apollon77) removed a check so that also devices that use other message formats can be read

### 2.0.3 (2019-07-11)
* (Apollon77) New schemas added
* (Apollon77) removed a check so that also devices that use other message formats can be read

### 2.0.2 (2019-06-27)
* (Apollon77) New schemas added
* (Apollon77) Update all Dependencies
* (Apollon77) Nodejs 6.x no longer supported!
* (Apollon77) Support encrypted devices

### 1.0.8 (2019-03-08) [Unreleased]
* (Apollon77) New schemas added

### 1.0.7 (2018-11-23)
* (Apollon77) New schemas added, fixed one error

### 1.0.5 (2018-11-18)
* (Apollon77) preserve device name too, New schemas

### 1.0.4 (2018-11-16)
* (Apollon77) New schemas added

### 1.0.3
* (Apollon77) New schemas added

### 1.0.2
* (Apollon77) New schemas added
* (Apollon77) Data are requested from the device after controlling because sometimes not all data seems to be updated automatically

### 1.0.1
* (Apollon77) Automatically convert some value types like booleans better

### 1.0.0
* (Apollon77) Add several new schema definitions
* (Apollon77) Optimizations and bug fixes

### 0.1.3
* (Apollon77) Add several new schema definitions
* (Apollon77) Try to preserve names of objects. Sync with App via proxy will overwrite in any case!
* (Apollon77) Optimizations and bug fixes

### 0.1.2
* (BuZZy1337) Optimized Admin, thank you very much!

### 0.1.0/1
* (Apollon77) development and first tests

## License

The MIT License (MIT)

Copyright (c) 2018-2022 Apollon77 <iobroker@fischer-ka.de>

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

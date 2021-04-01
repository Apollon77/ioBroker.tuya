# Proxy instructions for mobile Phones

## iOS

**Important: The Proxy is called "NodeMITMProxyCA" and no longer "Anyproxy" since 3.0.0!**

https://youtu.be/bHaL9ftU2zc

### Install Certificate
![Certificate 1](img/ios_Zertifikat_1.jpg)

![Certificate 2](img/ios_Zertifikat_2.jpg)

![Certificate 3](img/ios_Zertifikat_3.jpg)

![Certificate 4](img/ios_Zertifikat_4.jpg)

![Certificate 5](img/ios_Zertifikat_5.jpg)


### Enable Proxy
![Proxy 1](img/ios_Proxy_1.jpg)

![Proxy 2](img/ios_Proxy_2.jpg)

![Proxy 3](img/ios_Proxy_3.jpg)

![Proxy 4](img/ios_Proxy_4.jpg)

## Android

https://youtu.be/bHaL9ftU2zc?t=275

**Important: The Proxy is called "NodeMITMProxyCA" and no longer "Anyproxy" since 3.0.0!**

**Important: Some newer Android versions might NOT allow the self signed certificates anymore at all! So if you are sure you did anything correctly and it is still not working or only SSL errors are in the logs then please try an Android Emulator (see below)!**

### Install certificate

![Zertifikat](img/Android-Zertifikat.jpg)

Depending on your Android version an installation of the Certificate for "VPN and Apps" OR "Wifi" is needed. AN easy way is to just install it twice (once for both modes) :-)

### Enable PROXY

![Proxy](img/Android-Proxy.jpg)

### Detailed Step by Step Guide for using Proxy with Android and older App version

see [TuyaSync.pdf](https://raw.githubusercontent.com/Apollon77/ioBroker.tuya/master/TuyaSync.pdf)

A list of knwon compatible apps and versions can be found in [README.md](https://github.com/Apollon77/ioBroker.tuya#compatible-mobile-apps-and-versions) !

Thanks go to to HappyTeaFriend from ioBroker-Forum!

### Fallback Option if above do not work

This solution that works for user that also have a Windows computer was reported in [ioBroker Forum](https://forum.iobroker.net/topic/16103/aufruf-neuer-adapter-iobroker-tuya-wlan-devices-tuya-smart-life-und-andere/83) and is working wth an Android Simulator.
A second Andreoid Emulator approach is described at https://forum.iobroker.net/topic/23431/aufruf-tuya-adapter-tests-verschl%C3%BCsselte-ger%C3%A4te/19

https://youtu.be/bHaL9ftU2zc?t=157



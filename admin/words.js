/*global systemDictionary:true */
'use strict';

systemDictionary = {
    "DiscoveredInfo": {
        "en": "Success! %s devices and %s schemas discovered. Please check the log if new schemas should be reported to the developer. Proxy will be turned off in 10 seconds",
        "de": "Erfolg! %s Geräte und %s Schemata wurden erkannt. Überprüfen Sie das Log, wenn neue Schemas an den Entwickler gemeldet werden sollen. Der Proxy wird in 10 Sekunden ausgeschaltet",
        "ru": "Успех! обнаружены устройства%s и %s. Пожалуйста, проверьте журнал, если разработчикам сообщаются новые схемы. Прокси будет отключен через 10 секунд",
        "pt": "Sucesso! %s dispositivos e %s esquemas descobertos. Por favor, verifique o log se novos esquemas devem ser reportados ao desenvolvedor. O proxy será desativado em 10 segundos",
        "nl": "Succes! %s apparaten en %s schema's ontdekt. Controleer het logboek als er nieuwe schema's moeten worden gemeld aan de ontwikkelaar. Proxy wordt binnen 10 seconden uitgeschakeld",
        "fr": "Succès! %s périphériques et %s schémas découverts. Veuillez vérifier le journal si de nouveaux schémas doivent être signalés au développeur. Le proxy sera désactivé dans 10 secondes",
        "it": "Successo! %s dispositivi e %s schemi scoperti. Si prega di controllare il log se nuovi schemi devono essere segnalati allo sviluppatore. Il proxy verrà disattivato tra 10 secondi",
        "es": "¡Éxito! %s dispositivos y %s esquemas descubiertos. Compruebe el registro si se deben informar nuevos esquemas al desarrollador. El proxy se apagará en 10 segundos",
        "pl": "Sukces! % urządzeń i wykrytych %s schematów. Sprawdź dziennik, czy nowe schematy powinny zostać zgłoszone deweloperowi. Serwer proxy zostanie wyłączony za 10 sekund"
    },
    "StatusInfo": {
        "en": "Status: %s devices found in network, %s devices connected, %s with known schema, %s initialized for realtime updates and to control",
        "de": "Status: %s Geräte im Netzwerk gefunden, %s Geräte verbunden, %s mit bekanntem Schema, %s initialisiert für Echtzeit-Updates und zur Steuerung",
        "ru": "Статус: %s обнаружены в сети, подключены подключенные устройства%s, %s с известной схемой, %s инициализированы для обновлений в реальном времени и для управления",
        "pt": "Status: %s dispositivos encontrados na rede, %s dispositivos conectados, %s com esquema conhecido, %s inicializados para atualizações em tempo real e para controlar",
        "nl": "Status: %s apparaten gevonden in netwerk, %s apparaten verbonden, %s met bekend schema, %s geïnitialiseerd voor realtime updates en om te besturen",
        "fr": "État: %s périphériques trouvés sur le réseau, %s périphériques connectés, %s avec un schéma connu, %s initialisé pour les mises à jour en temps réel et pour le contrôle",
        "it": "Stato: dispositivi %s trovati in rete, dispositivi %s connessi, %s con schema conosciuto, %s inizializzati per aggiornamenti in tempo reale e per il controllo",
        "es": "Estado: %s dispositivos encontrados en la red, %s dispositivos conectados, %s con esquema conocido, %s inicializado para actualizaciones en tiempo real y para controlar",
        "pl": "Status: %s urządzenia znalezione w sieci, %s urządzenia połączone, %s ze znanym schematem, %s zainicjalizowane dla aktualizacji w czasie rzeczywistym i do kontroli"
    },
    "Polling Interval": {
        "en": "Polling Interval (if device was not synced with App)",
        "de": "Abrufintervall (wenn das Gerät nicht mit der App synchronisiert wurde)",
        "ru": "Интервал опроса (если устройство не синхронизировалось с приложением)",
        "pt": "Intervalo de pesquisa (se o dispositivo não foi sincronizado com o aplicativo)",
        "nl": "Polling-interval (als apparaat niet met app was gesynchroniseerd)",
        "fr": "Intervalle d'interrogation (si l'appareil n'a pas été synchronisé avec l'application)",
        "it": "Intervallo di polling (se il dispositivo non è stato sincronizzato con l'app)",
        "es": "Intervalo de sondeo (si el dispositivo no se sincronizó con la aplicación)",
        "pl": "Interwał odpytywania (jeśli urządzenie nie było zsynchronizowane z aplikacją)"
    },
    "Proxy-Info": {
        "en": "To be able to get realtime status updates and to control devices you need to sync then with the mobile App where the devices are registered (e.g. Smart Life). This is done by using the Adapter Web-Proxy in your WLAN connection together with a SSL certificate. More Information in <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\">README</a><br/><br/>Close/Kill the Tuya App. Start the proxy with the button below and follow the additional instructions.",
        "de": "Um Echtzeit-Status-Updates zu erhalten und Geräte zu steuern, müssen Sie diese mit der mobilen App synchronisieren, in der die Geräte registriert sind (z. B. Smart Life). Dazu verwenden Sie den Adapter-Web-Proxy in Ihrer WLAN-Verbindung zusammen mit einem SSL-Zertifikat. Weitere Informationen finden Sie in <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> README </a> <br/> <br/> Schließen / Beenden Sie die Tuya App. Starten Sie den Proxy mit der Schaltfläche unten und folgen Sie den weiteren Anweisungen.",
        "ru": "Чтобы получать обновления статуса в реальном времени и управлять устройствами, вам необходимо синхронизировать их с мобильным приложением, где регистрируются устройства (например, Smart Life). Это делается с помощью веб-прокси адаптера в вашем WLAN-соединении вместе с сертификатом SSL. Дополнительная информация в <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> README </a> <br/> <br/> Закрыть / Убить приложение Tuya. Запустите прокси с помощью кнопки ниже и следуйте дополнительным инструкциям.",
        "pt": "Para poder obter atualizações de status em tempo real e controlar dispositivos, é necessário sincronizar com o aplicativo móvel no qual os dispositivos estão registrados (por exemplo, Smart Life). Isso é feito usando o Adaptador Web Proxy em sua conexão WLAN junto com um certificado SSL. Mais informações em <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> LEIA-ME </a> <br/> <br/> Fechar / Matar o aplicativo Tuya. Inicie o proxy com o botão abaixo e siga as instruções adicionais.",
        "nl": "Om realtime statusupdates te krijgen en apparaten te kunnen bedienen, moet u deze synchroniseren met de mobiele app waarop de apparaten zijn geregistreerd (bijvoorbeeld Smart Life). Dit gebeurt met behulp van de Adaptor Web-Proxy in uw WLAN-verbinding samen met een SSL-certificaat. Meer informatie in <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> README </a> <br/> <br/> De Tuya-app sluiten / sluiten. Start de proxy met de onderstaande knop en volg de aanvullende instructies.",
        "fr": "Pour pouvoir obtenir des mises à jour de statut en temps réel et contrôler des appareils, vous devez vous synchroniser ensuite avec l'application mobile sur laquelle les appareils sont enregistrés (par exemple, Smart Life). Pour ce faire, utilisez Adapter Web-Proxy dans votre connexion WLAN avec un certificat SSL. Plus d'informations dans <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> LISEZMOI </a> <br/> <br/> Fermez / éliminez l'application Tuya. Démarrez le proxy avec le bouton ci-dessous et suivez les instructions supplémentaires.",
        "it": "Per poter ottenere aggiornamenti dello stato in tempo reale e controllare i dispositivi, è necessario sincronizzarsi con l'app mobile in cui sono registrati i dispositivi (ad es. Smart Life). Questa operazione viene eseguita utilizzando il proxy Web dell'adapter nella connessione WLAN insieme a un certificato SSL. Ulteriori informazioni in <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> README </a> <br/> <br/> Chiudi / uccidi l'app Tuya. Avvia il proxy con il pulsante in basso e segui le istruzioni aggiuntive.",
        "es": "Para poder obtener actualizaciones de estado en tiempo real y controlar los dispositivos, debe sincronizarlos luego con la aplicación móvil donde se registran los dispositivos (por ejemplo, Smart Life). Esto se hace utilizando el adaptador web-proxy en su conexión WLAN junto con un certificado SSL. Más información en <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> README </a> <br/> <br/> Cierre / mate la aplicación Tuya. Inicie el proxy con el botón de abajo y siga las instrucciones adicionales.",
        "pl": "Aby móc uzyskać aktualizacje statusu w czasie rzeczywistym i kontrolować urządzenia, które należy zsynchronizować, a następnie z aplikacją mobilną, w której są zarejestrowane urządzenia (np. Smart Life). Odbywa się to za pomocą adaptera Web-Proxy adaptera w połączeniu WLAN z certyfikatem SSL. Więcej informacji w <a href=\"https://github.com/Apollon77/ioBroker.tuya/blob/master/PROXY.md\" target=\"_blank\"> README </a> <br/> <br/> Zamknij / Kill the Tuya App. Uruchom proxy za pomocą przycisku poniżej i postępuj zgodnie z dodatkowymi instrukcjami."
    },
    "Proxy Port": {
        "en": "Proxy Port",
        "de": "Proxy-Port",
        "ru": "Порт прокси",
        "pt": "Porta proxy",
        "nl": "Proxypoort",
        "fr": "Port proxy",
        "it": "Porta proxy",
        "es": "Puerto proxy",
        "pl": "Port proxy"
    },
    "Proxy Web Info Port": {
        "en": "Proxy SSL-Zertifikat Port",
        "de": "Proxy SSL-Zertifikat Port",
        "ru": "Прокси SSL-Порт Зертификата",
        "pt": "Porta SSL-Zertifikat Proxy",
        "nl": "Proxy SSL-Zertifikat-poort",
        "fr": "Port proxy SSL-Zertifikat",
        "it": "Porta proxy SSL-Zertifikat",
        "es": "Puerto proxy SSL-Zertifikat",
        "pl": "Port proxy SSL-Zertifikat Port",
        "zh-cn": "代理SSL-Zertifikat端口"
    },
    "Start proxy": {
        "en": "Start proxy (be patient, can take some seconds!)",
        "de": "Proxy starten (geduldig sein, kann einige Sekunden dauern!)",
        "ru": "Запустите прокси (будьте терпеливы, может занять несколько секунд!)",
        "pt": "Iniciar proxy (seja paciente, pode demorar alguns segundos!)",
        "nl": "Start proxy (wees geduldig, kan enkele seconden duren!)",
        "fr": "Démarrez le proxy (soyez patient, cela peut prendre quelques secondes!)",
        "it": "Avvia proxy (sii paziente, può richiedere alcuni secondi!)",
        "es": "Iniciar proxy (sea paciente, puede tardar unos segundos)",
        "pl": "Uruchom proxy (bądź cierpliwy, może zająć kilka sekund!)"
    },
    "Stop proxy": {
        "en": "Stop proxy",
        "de": "Proxy stoppen",
        "ru": "Остановить прокси",
        "pt": "Parar proxy",
        "nl": "Stop proxy",
        "fr": "Stop proxy",
        "it": "Stop proxy",
        "es": "Detener proxy",
        "pl": "Zatrzymaj proxy"
    },
    "ProxySteps": {
        "en": "Use the QR-Code to add the certificate to your mobile phone, add the proxy for your mobile phone WLAN connection and open the Tuya App (e.g. Smart Life) once or reload to sync the devices",
        "de": "Verwenden Sie den QR-Code, um das Zertifikat zu Ihrem Mobiltelefon hinzuzufügen, fügen Sie den Proxy für die WLAN-Verbindung Ihres Mobiltelefons hinzu und öffnen Sie die Tuya-App (z. B. Smart Life) einmal oder laden Sie sie erneut, um die Geräte zu synchronisieren",
        "ru": "Используйте QR-код, чтобы добавить сертификат на свой мобильный телефон, добавьте прокси для своего мобильного телефона WLAN и откройте приложение Tuya (например, Smart Life) один раз или перезагрузите, чтобы синхронизировать устройства",
        "pt": "Use o QR-Code para adicionar o certificado ao seu celular, adicione o proxy para a conexão WLAN do seu celular e abra o aplicativo Tuya (por exemplo, Smart Life) uma vez ou recarregue para sincronizar os dispositivos",
        "nl": "Gebruik de QR-code om het certificaat aan uw mobiele telefoon toe te voegen, voeg de proxy toe voor de WLAN-verbinding van uw mobiele telefoon en open één keer de Tuya-app (bijvoorbeeld Smart Life) of herlaad om de apparaten te synchroniseren",
        "fr": "Utilisez le code QR pour ajouter le certificat à votre téléphone mobile, ajouter le proxy pour la connexion WLAN de votre téléphone portable et ouvrir l'application Tuya (par exemple, Smart Life) ou recharger pour synchroniser les appareils.",
        "it": "Utilizzare il codice QR per aggiungere il certificato al telefono cellulare, aggiungere il proxy per la connessione WLAN del telefono cellulare e aprire l'app Tuya (ad es. Smart Life) una volta o ricaricare per sincronizzare i dispositivi",
        "es": "Use el código QR para agregar el certificado a su teléfono móvil, agregue el proxy para la conexión WLAN de su teléfono móvil y abra la aplicación Tuya (por ejemplo, Smart Life) una vez o vuelva a cargarla para sincronizar los dispositivos",
        "pl": "Użyj kodu QR, aby dodać certyfikat do telefonu komórkowego, dodaj serwer proxy do połączenia WLAN w telefonie komórkowym i otwórz aplikację Tuya (np. Smart Life) lub załaduj ponownie, aby zsynchronizować urządzenia"
    }
};

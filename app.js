
firebase.initializeApp({
    messagingSenderId: '858298348971'
});

var app_btn_allow = $('#app_btn_allow');
var app_messaging;
var client_url_subscribe;
var client_token; //from site DB by client.id
var client_firebase_token;//for notify by firebase google

document.addEventListener('DOMContentLoaded', function () {
    app_init();
});

function app_init() {
    client_url_subscribe = helper_URL_getParameterByName('client_url_subscribe') || '';
    client_token = helper_URL_getParameterByName('client_token') || '';
    if (client_url_subscribe === '' || client_token === '') {
        app_showError('Invalid requests params');
    }
}

if (window.location.protocol === 'https:' &&
        'Notification' in window &&
        'serviceWorker' in navigator
        ) {
    app_messaging = firebase.messaging();

    // already granted
    if (Notification.permission === 'granted') {
        app_getToken();
    }

    // get permission on subscribe only once
    app_btn_allow.on('click', function () {
        app_getToken();
    });

    // Callback fired if Instance ID token is updated.
    app_messaging.onTokenRefresh(function () {
        app_messaging.getToken()
                .then(function (refreshedToken) {
                    app_showError('Token refreshed.');
                    // Send Instance ID token to app server.
                    app_sendTokenToServer(refreshedToken);
                })
                .catch(function (error) {
                    app_showError('Unable to retrieve refreshed token.', error);
                });
    });

} else {
    if (window.location.protocol !== 'https:') {
        app_showError('Is not from HTTPS');
    } else if (!('Notification' in window)) {
        app_showError('Notification not supported');
    } else if (!('serviceWorker' in navigator)) {
        app_showError('ServiceWorker not supported');
    }

    app_showError('This browser does not support desktop notification.');
    app_showError('Is HTTPS', window.location.protocol === 'https:');
    app_showError('Support Notification', 'Notification' in window);
    app_showError('Support ServiceWorker', 'serviceWorker' in navigator);
}


function app_getToken() {
    app_messaging.requestPermission()
            .then(function () {
                // Get Instance ID token. Initially this makes a network call, once retrieved
                // subsequent calls to getToken will return from cache.
                app_messaging.getToken()
                        .then(function (client_firebase_token) {
                            if (client_firebase_token) {
                                app_sendTokenToServer(client_firebase_token);
                            } else {
                                app_showError('No Instance ID token available. Request permission to generate one.');
                            }
                        })
                        .catch(function (error) {
                            app_showError('An error occurred while retrieving token.', error);

                        });
            })
            .catch(function (error) {
                app_showError('Unable to get permission to notify.', error);
            });
}



// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function app_sendTokenToServer(client_firebase_token) {
    console.log(client_url_subscribe);
    $.post(client_url_subscribe, {
        client_token: client_token,
        client_firebase_token: client_firebase_token
    }).done(function (response) {
        app_showInfo('Готово! Можно закрыть страницу.');
        console.log('SEND TOKEN TO SERVER ' + client_firebase_token);
    }).fail(function () {
        console.error('ERROR NOT SEND TOKEN TO SERVER ' + client_firebase_token);
    });

}

function app_showError(error, error_data) {
    if (typeof error_data !== "undefined") {
        console.error(error + ' ', error_data);
    } else {
        console.error(error);
    }

    var alert = $('#alert');
    var alert_message = $('#alert-message');

    alert.show();
    alert_message.html(error);
}
function app_showInfo(info) {
    console.warn(info);
    $('#info').show();
    $('#info-message').html(info);
}







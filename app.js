
firebase.initializeApp({
    messagingSenderId: '858298348971'
});

var app_btn_allow = $('#app_btn_allow');
var app_messaging;

document.addEventListener('DOMContentLoaded', function () {
    app_init();
});

function app_init() {}

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
                        showError('Token refreshed.');
                        // Send Instance ID token to app server.
                        app_sendTokenToServer(refreshedToken);
                    })
                    .catch(function (error) {
                        showError('Unable to retrieve refreshed token.', error);
                    });
        });

    } else {
        if (window.location.protocol !== 'https:') {
            showError('Is not from HTTPS');
        } else if (!('Notification' in window)) {
            showError('Notification not supported');
        } else if (!('serviceWorker' in navigator)) {
            showError('ServiceWorker not supported');
        }

        showError('This browser does not support desktop notification.');
        showError('Is HTTPS', window.location.protocol === 'https:');
        showError('Support Notification', 'Notification' in window);
        showError('Support ServiceWorker', 'serviceWorker' in navigator);
    }


function app_getToken() {
    app_messaging.requestPermission()
            .then(function () {
                // Get Instance ID token. Initially this makes a network call, once retrieved
                // subsequent calls to getToken will return from cache.
                app_messaging.getToken()
                        .then(function (currentToken) {
                            if (currentToken) {
                                app_sendTokenToServer(currentToken);
                            } else {
                                showError('No Instance ID token available. Request permission to generate one.');
                            }
                        })
                        .catch(function (error) {
                            showError('An error occurred while retrieving token.', error);

                        });
            })
            .catch(function (error) {
                showError('Unable to get permission to notify.', error);
            });
}



// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function app_sendTokenToServer(currentToken) {
    //$.post(url, {token: currentToken});
    console.log('SEND TOKEN TO SERVER ' + currentToken);
}

function showError(error, error_data) {
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






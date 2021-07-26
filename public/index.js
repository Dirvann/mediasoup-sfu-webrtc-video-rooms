if (location.href.substr(0, 5) !== 'https') location.href = 'https' + location.href.substr(4, location.href.length - 4);

const socket = io();

let producer = null;

nameInput.value = 'user_' + Math.round(Math.random() * 1000);

socket.request = function request(type, data = {}) {
    return new Promise((resolve, reject) => {
        socket.emit(type, data, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data);
            }
        });
    });
};

let rc = null;

function joinRoom(name, room_id) {
    if (rc && rc.isOpen()) {
        console.log('Already connected to a room');
    } else {
        initEnumerateDevices();

        rc = new RoomClient(
            localMedia,
            remoteVideos,
            remoteAudios,
            window.mediasoupClient,
            socket,
            room_id,
            name,
            roomOpen,
        );

        addListeners();
    }
}

function roomOpen() {
    login.className = 'hidden';
    reveal(startAudioButton);
    hide(stopAudioButton);
    reveal(startVideoButton);
    hide(stopVideoButton);
    reveal(startScreenButton);
    hide(stopScreenButton);
    reveal(exitButton);
    control.className = '';
    reveal(videoMedia);
}

function hide(elem) {
    elem.className = 'hidden';
}

function reveal(elem) {
    elem.className = '';
}

function addListeners() {
    rc.on(RoomClient.EVENTS.startScreen, () => {
        hide(startScreenButton);
        reveal(stopScreenButton);
    });

    rc.on(RoomClient.EVENTS.stopScreen, () => {
        hide(stopScreenButton);
        reveal(startScreenButton);
    });

    rc.on(RoomClient.EVENTS.stopAudio, () => {
        hide(stopAudioButton);
        reveal(startAudioButton);
    });
    rc.on(RoomClient.EVENTS.startAudio, () => {
        hide(startAudioButton);
        reveal(stopAudioButton);
    });

    rc.on(RoomClient.EVENTS.startVideo, () => {
        hide(startVideoButton);
        reveal(stopVideoButton);
    });
    rc.on(RoomClient.EVENTS.stopVideo, () => {
        hide(stopVideoButton);
        reveal(startVideoButton);
    });
    rc.on(RoomClient.EVENTS.exitRoom, () => {
        hide(control);
        reveal(login);
        hide(videoMedia);
    });
}

let isEnumerateDevices = false;

function initEnumerateDevices() {
    // Many browsers, without the consent of getUserMedia, cannot enumerate the devices.
    if (isEnumerateDevices) return;

    const constraints = {
        audio: true,
        video: true,
    };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            enumerateDevices();
            stream.getTracks().forEach(function (track) {
                track.stop();
            });
        })
        .catch((err) => {
            console.error('Access denied for audio/video: ', err);
        });
}

function enumerateDevices() {
    // Load mediaDevice options
    navigator.mediaDevices.enumerateDevices().then((devices) =>
        devices.forEach((device) => {
            let el = null;
            if ('audioinput' === device.kind) {
                el = audioSelect;
            } else if ('videoinput' === device.kind) {
                el = videoSelect;
            }
            if (!el) return;

            let option = document.createElement('option');
            option.value = device.deviceId;
            option.innerText = device.label;
            el.appendChild(option);
            isEnumerateDevices = true;
        }),
    );
}

'use strict';

import ReconnectingWebSocket from 'reconnecting-websocket';

const webSocket = new ReconnectingWebSocket('ws://localhost:8080');


console.log(webSocket);



webSocket.onopen = () => {

    webSocket.send(JSON.stringify({username:'remotePeer'}));

}

webSocket.onmessage = (data) => {

    console.log(data);
}
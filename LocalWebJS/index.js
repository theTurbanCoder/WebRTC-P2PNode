'use strict';




import ReconnectingWebSocket from 'reconnecting-websocket';

const webSocket = new ReconnectingWebSocket('ws://localhost:8080');


console.log(webSocket);







const MAX_CHUNK_SIZE = 262144;

let bytesToSend = 0;
let localConnection = 0;

let sendChannel;
let remoteChannel;

let receiveChannel;


async function createConnection(){

    const servers = null;

    const dataChannelParams = {ordered:false};


    localConnection = new RTCPeerConnection(servers);

    console.log(localConnection);
    sendChannel = localConnection.createDataChannel('sendDataChannel',dataChannelParams);
    console.log(sendChannel);

    sendChannel.onopen = onSendChannelOpen;
    sendChannel.onclose = onSendChannelClose;


    localConnection.addEventListener('iceCandidate',e => {onIceCandidate(localConnection,e)});

    try {
        
        const localOffer = await localConnection.createOffer();
        console.log('local offer has been created', localOffer);

        webSocket.onopen = () => {

            webSocket.send(JSON.stringify({username:'localPeer', localOffer: localOffer}));
        
        }

        webSocket.onmessage = (data) => {

            console.log(data);
        }


    } catch (error) {
        
    }


}



async function onIceCandidate(){}


function onSendChannelOpen(){
    console.log('send Chanel is open');
}

// 

function onSendChannelClose(){}

createConnection();
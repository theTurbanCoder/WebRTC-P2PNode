'use strict';
import ReconnectingWebSocket from 'reconnecting-websocket';
const webSocket = new ReconnectingWebSocket('ws://localhost:8080');
console.log(webSocket);
let filearray = ['test3.jpg','test4.jpg','test5.jpg'];
const MAX_CHUNK_SIZE = 262144;
let bytesToSend = 0;
let localConnection = 0;
let remoteConnection;
let sendChannel;
let remoteChannel;
let remoteAnswer = null;
let receiveChannel;
let localOfferSend = null;
let remoteCandidate = null;
let localOffer = null;
webSocket.onopen = () => {
    webSocket.send(JSON.stringify({username:'localPeer', type:"addUser"}));
}



webSocket.onmessage = (data) => {
   let msg = (JSON.parse(data.data));
   console.log(msg);
    switch (msg.type) {
        case 'sendLocalOffer':
        console.log('local Offer')
            webSocket.send(JSON.stringify({localOffer:localOffer, type:"offer"}));
        break;

        case 'answer':
            console.log('remote Answer',msg.remoteAnswer);
            handleRemoteAnswer(msg.remoteAnswer);
        break;

        case 'sendLocalCandidate':
            console.log('send local candidate');
            if (localOfferSend) {
                console.log('local candidate send ',localOfferSend);
                webSocket.send(JSON.stringify({localCandidate:localOfferSend, type:"localCandidate"}));
            }
        break;


        case 'remoteCandidate':   
            handleRemoteCandidate(msg.remoteCandidate);
        break;

        default:
        break;
    }
}

async function handleRemoteCandidate(remoteCandidate)
{
    try {
        console.log(remoteCandidate)
        await localConnection.addIceCandidate(remoteCandidate);
        console.log('AddIceCandidate successful: ', remoteCandidate);
    } catch (e) {
      console.error('Failed to add Ice Candidate: ', e);
    }
}



async function createConnection(){

    const servers = null;
    const dataChannelParams = {ordered:false,binaryType:'blob'};
    localConnection = new RTCPeerConnection(servers);
    console.log(localConnection);
    sendChannel = localConnection.createDataChannel('sendDataChannel',dataChannelParams);
    console.log(sendChannel);
    sendChannel.onopen = onSendChannelOpen;
    sendChannel.onclose = onSendChannelClose;
    sendChannel.addEventListener('message',sendChannelGotData);
    localConnection.addEventListener('icecandidate',e => {onIceCandidate(localConnection,e)});
    try {
        localOffer = await localConnection.createOffer();
        console.log('local offer has been created', localOffer);
        localOfferSend =  localOffer;
        await handleDescription(localOffer);
    } catch (error) {}
}

function sendChannelGotData(event)
{
    console.log("Send Channle got", event.data);
}

function handleRemoteAnswer(desc)
{
    console.log("TRmote answer",desc.sdp);
    localConnection.setRemoteDescription(desc);
}

 function handleDescription(desc)
{
    console.log("SDP", desc.sdp);
    localConnection.setLocalDescription(desc)
}


async function onIceCandidate(pc,e){
    const candidate =  e.candidate;
    console.log(e.candidate)
    if (candidate === null)
    {
        return;
    }
    else {
        localOfferSend = candidate
        console.log('localOffer',localOfferSend)
    }
}


function getOtherPC(pc) {
   return pc;
}

async function fetchData(url,filename)
{
    var blob =  await fetch(url+filename).then((response) => {
        return response.blob().then((blob) => blob )
    });
    console.log('Blboab', blob);
    return blob;
}

async function onSendChannelOpen(){

    let i = 0;
    while (i<300) {
        let randomArr = filearray.sort(() => 0.5 - Math.random() );
        for (let img in randomArr)
        {
            let blob = await fetchData('http://127.0.0.1:5501/stub-data/',`${randomArr[img]}`);
            console.log('send Chanel is open');
            sendChannel.send(blob);
        }        
        i+=1;
    }
}

function onSendChannelClose(){}
createConnection();
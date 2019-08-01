'use strict';
import ReconnectingWebSocket from 'reconnecting-websocket';
const moment = require('moment');
const webSocket = new ReconnectingWebSocket('ws://3.82.120.170:8080');

let filearray = ['test3.jpg','test4.jpg','test5.jpg'];
const MAX_CHUNK_SIZE = 622144;
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

    switch (msg.type) {
        case 'sendLocalOffer':

            webSocket.send(JSON.stringify({localOffer:localOffer, type:"offer"}));
        break;

        case 'answer':

            handleRemoteAnswer(msg.remoteAnswer);
        break;

        case 'sendLocalCandidate':

            if (localOfferSend) {

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

        await localConnection.addIceCandidate(remoteCandidate);

    } catch (e) {
      console.error('Failed to add Ice Candidate: ', e);
    }
}



async function createConnection(){

    const servers = null;
    const dataChannelParams = {ordered:false};
    localConnection = new RTCPeerConnection(servers);

    sendChannel = localConnection.createDataChannel('sendDataChannel',dataChannelParams);

    sendChannel.onopen = onSendChannelOpen;
    sendChannel.onclose = onSendChannelClose;
    sendChannel.addEventListener('message',sendChannelGotData);
    localConnection.addEventListener('icecandidate',e => {onIceCandidate(localConnection,e)});
    try {
        localOffer = await localConnection.createOffer();
      
        localOfferSend =  localOffer;
        await handleDescription(localOffer);
    } catch (error) {}
}

function sendChannelGotData(event)
{
    // console.log("Send Channle got", event.data);
}

function handleRemoteAnswer(desc)
{

    localConnection.setRemoteDescription(desc);
}

 function handleDescription(desc)
{

    
    localConnection.setLocalDescription(desc)
}


async function onIceCandidate(pc,e){
    const candidate =  e.candidate;

    if (candidate === null)
    {
        return;
    }
    else {
        localOfferSend = candidate
  
    }
}


function getOtherPC(pc) {
   return pc;
}

async function fetchData(url,filename)
{
    var buffer =  await fetch(url+filename).then((response) => {
        return response.blob().then((blob) => blob )
    }).catch((error) => {console.log('fuck this error',error)});

    return buffer;
}

async function onSendChannelOpen(){

    let i = 0;
    while (i<1000) {
        let randomArr = filearray.sort(() => 0.5 - Math.random() );
        for (let img in randomArr)
        {
            let blob = await fetchData('http://127.0.0.1:5501/stub-data/',`${randomArr[img]}`);
           
            await sendChannel.send(blob);

            webSocket.send(JSON.stringify({type:'date', sentDate: new Date()}));
            

        }        
        i+=1;
    }
}

function onSendChannelClose(){}
createConnection();
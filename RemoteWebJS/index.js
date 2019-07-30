'use strict';
import ReconnectingWebSocket from 'reconnecting-websocket';
const webSocket = new ReconnectingWebSocket('ws://localhost:8080');
let remoteConnection;
let localOffer;
let remoteAnswer;
let localConnection; 
let localCandidate = null;
let receiveChannel;

async function createConnection(){
    const servers= null;
    remoteConnection = new RTCPeerConnection(servers);
    remoteConnection.addEventListener('icecandidate', e => { onIceCandidate(remoteConnection,e)} )
    remoteConnection.addEventListener('datachannel',receiveChannelCallback)
    console.log(remoteConnection);
}

async function handleDescription(desc) {
    console.log(desc.sdp);
    remoteConnection.setRemoteDescription(desc)
    try {
        remoteAnswer = await remoteConnection.createAnswer();
        console.log('remote Answer',remoteAnswer);
        handleRemoteAnswer(remoteAnswer);
    }
    catch(error)
    {}
}
async function handleRemoteAnswer(desc) {
    remoteConnection.setLocalDescription(desc);
    console.log('set remote Answer on remote local descritption', desc.sdp);
    webSocket.send(JSON.stringify({type:'remoteAnswer',remoteAnswer:remoteAnswer }));
}


function receiveChannelCallback(event){
    console.log('receive channel callback');
    receiveChannel = event.channel
    console.log('Receive Chanenl',receiveChannel)
    receiveChannel.binaryType ='blob';
    receiveChannel.addEventListener('close',onReceiveChannelClosed)
    receiveChannel.addEventListener('message',onReceiveMessageCallback);
}

async function onReceiveMessageCallback(event){
    console.log("Message:", event);
    var blob = event.data
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL( blob );
    console.log('url of image  is ',imageUrl);
    document.getElementById('bitmapdata').src = imageUrl;
    receiveChannel.send('Tanveer Anand did the work fuck this is basic shit.')
}
function onReceiveChannelClosed(){}
function getOtherPc(pc){
    return remoteConnection;
}
async function onIceCandidate(pc,e){
    const remoteCandidate = e.candidate;
    if (remoteCandidate === null ){
        return
    }
    else{
        webSocket.send(JSON.stringify({type:'remoteCandidate',remoteCandidate:remoteCandidate}))
    }
}
async function addLocalCandidate(localCandidate)
{
  try {
        console.log(localCandidate)
        await remoteConnection.addIceCandidate(localCandidate);
        console.log('AddIceCandidate successful: ', localCandidate);
    } catch (e) {
      console.error('Failed to add Ice Candidate: ', e);
    }
}
console.log(webSocket);
webSocket.onopen = () => {
    webSocket.send(JSON.stringify({username:'remotePeer',type:'addUser'}));
}
webSocket.onmessage = (msg) => {
     msg = JSON.parse(msg.data)
    switch (msg.type) {
        case 'offer':
        console.log('remote peer',msg.localOffer)
        handleDescription(msg.localOffer);
        break;

        case 'localCandidate':
        console.log('localCandidate',msg.localCandidate);
        if (!localCandidate) {
            localCandidate = msg.localCandidate;
            addLocalCandidate(localCandidate)
        }
        default:
            break;
    }
}
createConnection();
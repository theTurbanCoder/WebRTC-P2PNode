'use strict';
import ReconnectingWebSocket from 'reconnecting-websocket';
const webSocket = new ReconnectingWebSocket('ws://3.82.120.170:8080');
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
const moment = require('moment'); 
let test_count =0;
let remoteConnection;
let localOffer;
let remoteAnswer;
let localConnection; 
let localCandidate = null;
let receiveChannel;

let imageUrl;

let previousURL;

$(document).ready(function(){

    var averageElement = document.getElementById('average');
    averageElement.value = 'Average Time : ' + 0;



    let sentDate = null;
    let currentDate = null;


    let receivedTime = null;;
    let sentTime =  null;

    var mainD = [];
    var mainD21 = [];
    var mainD23 = [];
    var mainD34 = [];

    var count = 0;
    
   

    var chart = null;
    var chart1 = null;
    var chart2 = null;
    var chart3 = null;

    var ctx = document.getElementById('myChart').getContext('2d');

  let dataCh =  {
        labels: [new Date().getMinutes()],
        datasets: [{
            label: 'Delta T4 - T1',
            backgroundColor: 'rgb(255, 99, 132)',
           
            data: mainD,
            fill:false,
            lineTension: 0
        }]
    }
    let options = {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data:dataCh,
    
        // Configuration options go here
        options: {}
    }


    var timeS = new Date();




    function utcTime(now)
    {
        
        var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        return utc
    }
    



    function updateMyChart(chart,mydata,dataSet){

        chart.data.labels.push(new Date().getMinutes());
    
        chart.data.datasets[dataSet].data.push(mydata);
    
        chart.update();
      }


async function createConnection(){
    const servers = {'iceServers': [{'urls':'stun:stun01.sipphone.com'}]};
    remoteConnection = new RTCPeerConnection(servers);
    remoteConnection.addEventListener('icecandidate', e => { onIceCandidate(remoteConnection,e)} )
    remoteConnection.addEventListener('datachannel',receiveChannelCallback)

}



function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}



async function handleDescription(desc) {

    remoteConnection.setRemoteDescription(desc)
    try {
        remoteAnswer = await remoteConnection.createAnswer();

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
    
    receiveChannel = event.channel

    // receiveChannel.binaryType ='blob';
    receiveChannel.addEventListener('close',onReceiveChannelClosed)
    receiveChannel.addEventListener('message',onReceiveMessageCallback);
}

async function onReceiveMessageCallback(event){
 
    receivedTime =  moment(new Date());
    if (event.data instanceof Blob) {
        let data =  event.data;
        var blob = data;
        var urlCreator = window.URL || window.webkitURL;
        imageUrl = urlCreator.createObjectURL( blob );
        document.getElementById('bitmapdata').src = imageUrl;

    
        if (!previousURL || previousURL === null) {
            previousURL = imageUrl;
        } else {
            
            if(previousURL!=imageUrl){
                let tempUrl = previousURL;
                window.URL.revokeObjectURL(tempUrl);
                previousURL = imageUrl;
            }

        }

    }


    if(sentDate && receivedTime)
        {
            if(count === 0)
            {
                count+=1;
                test_count+=1;
                console.log(test_count)
                var diff = moment.duration(receivedTime.diff(sentDate));
                diff = diff.asMilliseconds()
                diff >= 0 ? mainD.push(diff) : mainD.push(0);
                chart = new Chart(ctx,options);
                averageElement.value = 'Average Time : ' + diff;
            }       
            else{
                test_count+=1;
                console.log(test_count)
                var diff = moment.duration(receivedTime.diff(sentDate));
                diff = diff.asMilliseconds();
                (diff < 0) ? diff = 0 :  diff= diff; 
                updateMyChart(chart, (diff),0)
                averageElement.value = 'Average Time : ' + ( mainD.reduce((a,b) => a+b,0) / mainD.length);
            }
        }


//     // console.log(event)

// else {


//     console.log(event.data)

//     let sentTime = event.data
//     // console.log(sentTime);
    

//         if(count === 0)
//         {
            
//             count+=1;
//             var diff = moment.duration(receivedTime.diff(sentTime));
//             diff = diff.asMilliseconds()
//             diff >= 0 ? mainD.push(diff) : console.log("DIFFFFFF",diff);
//             chart = new Chart(ctx,options);
//             averageElement.value = 'Average Time : ' + diff;
        
//         }
        
//         else{
//             var diff = moment.duration(receivedTime.diff(sentTime));
//             diff = diff.asMilliseconds()
//             console.log(diff);
//             updateMyChart(chart, (diff),0)
//             averageElement.value = 'Average Time : ' + ( mainD.reduce((a,b) => a+b,0) / mainD.length);
//         }

//     }



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
       
        await remoteConnection.addIceCandidate(localCandidate);
        console.log('AddIceCandidate successful: ', localCandidate);
    } catch (e) {
      console.error('Failed to add Ice Candidate: ', e);
    }
}

webSocket.onopen = () => {
    webSocket.send(JSON.stringify({username:'remotePeer',type:'addUser'}));
}
webSocket.onmessage = (msg) => {
     msg = JSON.parse(msg.data)
    switch (msg.type) {
        case 'offer':
 
        handleDescription(msg.localOffer);
        break;

        case 'localCandidate':
        
        if (!localCandidate) {
            localCandidate = msg.localCandidate;
            addLocalCandidate(localCandidate)
        }
        break;

        case 'date':
        sentDate = moment(new Date(msg.sentDate));
        

        break;


        default:
            break;
    }
}
createConnection();

});

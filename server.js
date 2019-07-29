class Clients {
    constructor(){
        this.clientList = {}
        this.saveClient = this.saveClient.bind(this); 
    }

    saveClient(username,client){
        this.clientList[username] = client;
    }
}


const ws = require('ws');

const wss = new ws.Server({
    port: 8080
  });


const clients =  new Clients();
let localOffer=  null;

let remoteAnswer = null;

let remotePeer =  null;
let localPeer = null;


let count = 0;
console.log(ws);

wss.on('connection', (client) => {

    client.on('message',(data) => {

      let msg = JSON.parse(data);

      
      switch (msg.type) {
        case "addUser":

        if(!clients.clientList[msg.username])
        {
          console.log('added user');
          clients.saveClient(msg.username,client);

          if (clients.clientList['localPeer'] && clients.clientList['remotePeer']) {
            clients.clientList['localPeer'].send(JSON.stringify({type:'sendLocalOffer',username:'localPeer'}))
          }
        
        }
      
          
          break;
      

          case 'offer':

          if(!localOffer)
          {
            console.log('local offer');
            localOffer = msg.localOffer;
            
            clients.clientList['remotePeer'] ? clients.clientList['remotePeer'].send(JSON.stringify({type:'offer',localOffer:localOffer})) : null
          }

          break;


          case 'remoteAnswer':
          
              remoteAnswer =  msg.remoteAnswer;
              clients.clientList['localPeer'] ? clients.clientList['localPeer'].send(JSON.stringify({type:'answer',remoteAnswer:remoteAnswer})) : null
              clients.clientList['localPeer'] ? clients.clientList['localPeer'].send(JSON.stringify({type:'sendLocalCandidate'})) : null
          break;


          case 'localCandidate':


            console.log('localCandiate',msg.localCandidate);
            clients.clientList['remotePeer'] ? clients.clientList['remotePeer'].send(JSON.stringify({type:'localCandidate',localCandidate:msg.localCandidate})) : null
            
            break;

            case 'remoteCandidate':

                console.log('localCandiate',msg.remoteCandidate);
                clients.clientList['localPeer'] ? clients.clientList['localPeer'].send(JSON.stringify({type:'remoteCandidate',remoteCandidate:msg.remoteCandidate})) : null

            break;


        default:
          break;
      }

    });


   
  

});






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
    port: 8080,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024 // Size (in bytes) below which messages
      // should not be compressed.
    }
  });


const clients =  new Clients();

console.log(ws);

wss.on('connection', (client) => {

    client.on('message',(data) => {

        const f =  JSON.parse(data);
        // console.dir(f);

        clients.saveClient(f.username,client)

        
        clients.saveClient(f.username,client);

        clients.clientList['remotePeer'] ? clients.clientList['remotePeer'].send('remotePeer')  : null;
        clients.clientList['localPeer'].send('LocalPeeer');
        

        console.log(typeof f.localOffer);

    })

});





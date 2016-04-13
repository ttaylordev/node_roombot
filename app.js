const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();

const channel = 'simulation:wmYNlQ==';
const roombaIP = 'roombots.mx.com';

const phxJoin = function (connection) {
  const initMessage = {
    topic: channel,
    event: 'phx_join',
    ref: 1,
    payload: {}
  };

  if (connection.connected) {
    connection.sendUTF(JSON.stringify(initMessage));
  }
};

const heartbeat = function (connection) {
  console.log('Heart Beating');

  const heartbeatMessage = {
    topic: 'phoenix',
    event: 'heartbeat',
    payload: {},
    ref: 10
  };

  setInterval(function () {
    connection.sendUTF(JSON.stringify(heartbeatMessage));
  }, 1000)
};

const drive = function (connection) {
  connection.on('message', function (message) {
    const response = JSON.parse(message.utf8Data);

    if (response.event === 'phx_reply' && response.ref === 1) {
      const driveMessage = {
        topic: channel,
        event: 'drive',
        ref: 15,
        payload: {
          velocity: 100,
          radius: 50
        }
      };

      connection.sendUTF(JSON.stringify(driveMessage));
    }
  });
}

client.on('connectFailed', function (error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function (connection) {
  console.log('WebSocket Client connected');

  phxJoin(connection);
  heartbeat(connection);
  drive(connection);
});

client.connect('ws://' + roombaIP + '/socket/websocket?vsn=1.0.0');


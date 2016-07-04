# Browswer Roombot

A starter kit for driving a roombot.
http://roombots.mx.com/simulations

## Driving The Simulator

There is an online simulator you can use to test your code at http://roombots.riesd.com/simulator.
Once you have a simulation open it will tell you which channel you should connect to.
Now clone this repository to your computer and edit the `app.js` file so the channel matches the suggestion from the simulator.

Now run `node app.js` and verify you are seeing the correct console logs in your terminal.

You can start editing the the javascript to change what it should do when it gets sensor updates.

## Driving a Real Roombot
Real roombots always use `roomba` as the channel name so you can edit your `index.html` file and set `channel = "roomba";`.
You will need to know the IP address of the roombot.
You can check the [recent bots page](http://roombots.riesd.com/bots) online.
Edit your `app.js` file and set `roombotIP = '<IP-of-the-roombot>';`.
Now when you run the application you should be connected to the real roombot.

Good luck on your driving adventures! :tada: :+1:



## JSON Structure
All the JSON messages you send to the websocket and receive from the websocket will have a similar structure. The structure is the standard followed by Phoenix Channels.

topic All messages happen in a topic. Roombot always uses "topic":"roomba".
event The event is a sort of type for a message. It makes it easy to distinguish between a move command an an update about the sensors on the roomba.
ref A ref is a unique identifier for a given message. Each time you send a message to the roombot, the roombot can respond that request and it will include the same ref.
payload This is where you put any data that are sending and where the roombot puts any data that is is sending. It is always a JSON object (never a list or a single scalar value).


## An Example Session
The best way to describe these messages is just to give an example of what your program might send and receive. I'll put some notes along the way to help point out the patterns you can depend on.



When you first connect to the roombot you will need to send a phx_join message. This tells the roombot that it should start sending you status updates and expect you to send driving commands.
Your Program => Roombot

```javascript

{
  "topic":"roomba", // All messages happen in a topic. Roombot always uses "topic":"roomba".
  "event":"phx_join", // The event is a sort of type for a message. It makes it easy to distinguish between a move command and an update about the sensors on the roomba.
  "ref":1, // A ref is a unique identifier for a given message. Each time you send a message to the roombot, the roombot can respond that request and it will include the same ref.
  "payload":{} // This is where you put any data that are sending and where the roombot puts any data that is is sending. It is always a JSON object (never a list or a single scalar value).
}

```

The Roombot will send back a phx_reply message to let you know that you have successfully joined the topic.

Note: the roombot sent back "ref": 1 because that is the ref we sent when we asked to join the topic. The "ref" is how we know which messages from the roombot are responses to our requests.
Roombot => Your Program

```javascript
{
  "topic":"roomba",
  "event":"phx_reply",
  "ref":1,
  "payload":{
    "status":"ok",
    "response":{}
  }
}
```

Now the roombot will start to send you sensor updates. These messages tell you what is happening with the roomba.

light_bumper_* these are infrared sensors along the front of the roomba that detect objects between 1-3" away. They have a value of 0 or 1.
bumper_* the physical bumper sensors. Also have values of 0 or 1.
battery_* the capacity and current charge of the battery measured in mAh
For more details please see sensors page.
Roombot => Your Program

```javascript
{
  "topic":"roomba",
  "ref":null,
  "payload":{
    "light_bumper_right_front":0,
    "light_bumper_right_center":0,
    "light_bumper_right":0,
    "light_bumper_left_front":0,
    "light_bumper_left_center":1,
    "light_bumper_left":0,
    "bumper_right":0,
    "bumper_left":0,
    "battery_charge":2751,
    "battery_capacity":2366
  },
  "event":"sensor_update"
}
```

Once you know where you want to go you can send a drive command. The velocity is measured in mm/s. -500 to 500 are the valid values. The radius is a desired radius you want to turn through. It is measures as mm between the center of the roomba and the center of the turning circle. Negative values turn left and positive values turn right. -2000 to 2000 are valid values. 0 will drive straight.
Your Program => Roombot

```javascript
{
  "topic":"roomba",
  "event":"drive",
  "ref":12,
  "payload":{
    "velocity": 100,
    "radius": -500
  }
}
```

Sometimes you will want to healthcheck your websocket or just send a small message to keep the network connection active. This will keep the latency low between the roombot and your program. To do this you can send a heartbeat message
Your Program => Roombot

```javascript
{
  "topic":"phoenix",
  "event":"heartbeat",
  "payload":{},
  "ref":"6"
}
```

The Roombot will send back a phx_reply message to let you know that it got your heartbeat.

Note: I send a hearbeat once per second for most of my driving programs.
Roombot => Your Program

```javascript
{
  "topic":"phoenix",
  "ref":"6",
  "payload":{
    "status":"ok",
    "response":{}
  },
  "event":"phx_reply"
}
```

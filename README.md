# Browswer Roombot

A starter kit for driving a roombot.

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

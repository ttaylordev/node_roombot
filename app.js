const WebSocketClient = require( 'websocket' ).client;
const client = new WebSocketClient();

const roombaIP = 'roombots.mx.com';
const channel = 'simulation:jwnXRA==';
const socketConnection = 'ws://roombots.mx.com:80/socket/websocket';


const slow = 300;
const medium = 1000;
const fast = 2000;
const veryFast = 5000;

const straight = 0;
const radiusTight = 100;
const radiusMedium = 700;
const radiusWide = 1000;




var vel = 8000;
var rad = 0;



const phxJoin = function ( connection ) {
  const initMessage = {
    topic: channel,
    event: 'phx_join',
    ref: 1,
    payload: {}
  };

  if ( connection.connected ) {
    connection.sendUTF( JSON.stringify( initMessage ) );
  }
};

const heartbeat = function ( connection ) {
  console.log( 'Heart Beating' );

  const heartbeatMessage = {
    topic: 'phoenix',
    event: 'heartbeat',
    payload: {},
    ref: 10
  };

  setInterval( function () {
    console.log( 'pulse-thump' );
    connection.sendUTF( JSON.stringify( heartbeatMessage ) );
  }, 1000 )
};

////////  DRIVE  \\\\\\\\
const drive = function ( connection ) {
  connection.on( 'message', function ( message ) {
    const response = JSON.parse( message.utf8Data );
    // console.log(connection);
    // console.log( response );

    ///////  ARRAY APPROACH  \\\\\\\

    var load = response.payload
    var arr = [ load.light_bumper_left, load.light_bumper_left_center, load.light_bumper_left_front, load.light_bumper_right, load.light_bumper_right_center, load.light_bumper_right_front ]

    var centerArr = [ load.light_bumper_left_front, load.light_bumper_right_front ]
    var leftArr = [ load.light_bumper_left, load.light_bumper_left_center, load.light_bumper_left_front ]
    var rightArr = [ load.light_bumper_right, load.light_bumper_right_center, load.light_bumper_right_front ]

    var sum = arr.reduce( ( a, b ) => a + b, 0 );


    var actionDone;
    // function whatever() {
    //   if ( !actionDone ) {
    //     actionDone = true;
    //   }
    // }
    // console.log(response.payload);

    // minor adjustment interval function
    // large correction(right or left)
    //
    /*
            ARRAY     Action Needed           Condition       Refined Condition                 Refined further Bi-Dec#
            1 0 0 0 0 0 -minor adjustment   --if 1 0 0 0 0 0  if(arr[0] && !arr[1,2,3,4,5])       if(arr[0] && !sum)                  --32
            1 0 0 0 0 0 -minor adjustment   --if 0 0 0 0 0 1  if(arr[5] && !arr[0,1,2,3,4])       if(arr[5] && !sum)                  --1
            1 1 0 0 0 0 -medium adjustment  --if 1 1 x x x 0  if(arr[0] && arr[1])                if(!arr[5] && sum >= 2)             --62-48
            0 0 0 0 1 1 -medium adjustment  --if 0 x x x 1 1  if(arr[4] && arr[5])                if(!arr[0] && sum >= 2)             --3-31
            0 1 1 1 1 0 -large correction   --if 0 1 x x 1 0  if(arr[1] && arr[4] && !arr[0,5])   if(!arr[0] && !arr[5] && sum >= 2)  --18-30
            0 0 1 1 0 0 -large correction   --if 0 x 1 1 x 0  if(arr[2] && arr[3] && !arr[0,5])    ^^       ^^         ^^             --12-30
            1 1 1 1 1 1 -backup large corr                                                        if(sum === 6)
                                                                                                  if(sum > 3)
          //  else resume(fast);
        */
    /// logging sensor output \\
    if ( sum > 0 ) {
      console.log( 'arr: ' + arr + ', sum: ' + sum );
    }


// cases \\
    if ( arr[ 0 ] && !sum ) {
      console.log( 'small, right' );
      minorAdj( 'right' );
    }

    if ( arr[ 5 ] && !sum ) {
      console.log( 'small, left' );
      minorAdj( 'left' );
    }

    if ( !arr[ 5 ] && sum >= 2 ) { //
      console.log( 'medium, right' );
      mediumAdj( 'right' );
    }

    if ( !arr[ 0 ] && sum >= 2 ) { //
      console.log( 'medium, left' );
      mediumAdj( 'left' );
    }

    if ( ( !arr[ 0 ] && !arr[ 5 ] && sum >= 2 ) || ( sum === 6 ) ) {
      console.log( 'large, right' );
      largeCorr( 'right' );
    } else
    /// PROCEED \\\
    function proceed( speed ) {
      speed = speed || fast
      vel = speed;
      rad = 0;
    };




    ////   massive potential   \\\\\\\\
    ///  could be used to convert text to image, if the bot was small enough \\\
    /// could make sketches on cavas from photos. it could be programmed to collide only with certain colors \\\

    // write a function to determine vector based on speed, radius, and duration(time) of turn
    // use a combination of speed and degrees to plot x, y coordinates
    // log the coordinates, on new position(not already cached)
    // draw a map of the area
// TODO: backup on medium adjustments

    /// MINOR adjustment \\\
    function minorAdj( direction, speed ) {
      speed = speed || fast
      console.log( 'Minor adjustment made to the: ' + direction );
      vel = speed;
      if ( direction == 'right' ) {
        rad = radiusWide
      } else
        rad = -( radiusWide )
    }

    /// MEDIUM adjustment \\\
    function mediumAdj( direction, speed ) {
      speed = speed || medium
      console.log( 'Medium adjustment made to the: ' + direction );
      vel = speed;
      if ( toString(direction) == 'right' ) {
        rad = radiusMedium
      } else {
        rad = -( radiusMedium )
      }
    };

    /// LARGE correction \\\
    function largeCorr( direction, speed ) {
      speed = speed || slow
      console.log( 'Large correction made to the: ' + direction );
      vel = speed;
      if ( direction == 'right' ) {
        rad = radiusTight
      } else {
        rad = -( radiusTight )
      }
    };

    ////// DRIVE MESSAGE \\\\\\\
    const driveMessage = {
      topic: channel,
      event: 'drive',
      ref: 15,
      payload: {
        velocity: vel,
        radius: rad
      }
    }
    connection.sendUTF( JSON.stringify( driveMessage ) );

  } );
}



//  WATCHING


client.on( 'sensor_update', function ( message ) {
  const reponse = JSON.parse( message.utf8Data );
  // console.log( response );

} )
client.on( 'connectFailed', function ( error ) {
  console.log( 'Connect Error: ' + error.toString() );
} );

client.on( 'connect', function ( connection ) {
  console.log( 'WebSocket Client connected' );

  phxJoin( connection );
  heartbeat( connection );
  drive( connection );
} );

// client.connect('ws://' + roombaIP + '/socket/websocket?vsn=1.0.0');
client.connect( socketConnection );



/*
// not sure if my cases can be expressions. \\
    switch ( arr ) {
    case ( arr[ 0 ] && !sum ):
      console.log( 'hello' );
      minorAdj( 'right' );
      break;
    case ( arr[ 5 ] && !sum ):
      console.log( 'hello' );
      minorAdj( 'left' );
      break;
    case ( !arr[ 5 ] && sum >= 2 ):
      console.log( 'hello' );
      mediumAdj( 'right' );
      break;
    case ( !arr[ 0 ] && sum >= 2 ):
      console.log( 'hello' );
      mediumAdj( 'left' );
      break;
    case ( ( !arr[ 0 ] && !arr[ 5 ] && sum >= 2 ) || ( sum > 4 ) ):
      console.log( 'hello' );
      largeCorr();
      break;
    default:
      proceed();

    }
*/





/*
/////// frontal collision \\\\\\\\
if ( response.payload.light_bumper_left_center > 0 || response.payload.light_bumper_right_center > 0 ) {
  console.log( response.payload );
  if ( !actionDone ) {
    console.log( 'executing frontal collision ' );
    console.log( ' actionDone is equal to:' + actionDone );
    vel = -2000;
    rad = 0; /* -132 */
/*
    var newAction;
    actionDone = true;
  }
  setTimeout( function () {
    if ( !newAction ) {
      console.log( actionDone );
      console.log( 'resuming front frontal collision, after backing up' );
      vel = 4000;
      rad = 0;
      actionDone = false;
    }
  }, 2000 );
}
*/




/**/


/// listen for sensor data
// if sensor data
/// handle sensor data
/// make correction
// give a vel & rad,
/// proceed

////// RIGHT  IR \\\\\\\
//  Far RIGHT
// if ( response.payload.light_bumper_right > 0 ) {
//   console.log( response.payload + 'from farRight' );;
//   vel = -200;
//   rad = -70;
//   setTimeout( function () {
//     console.log( response.payload + 'resuming from farRight' );
//     vel = 4000;
//     rad = 0;
//   }, 1000 );
// }
//
//
// //  right CENTER
// if ( response.payload.light_bumper_right_center > 0 ) {
//   console.log( response.payload );
//   vel = -200;
//   rad = -132;
//   setTimeout( function () {
//     vel = 4000;
//     rad = 0;
//   }, 1000 );
//       // }

// //  right FRONT
// if ( response.payload.light_bumper_right > 0 ) {
//   console.log( response.payload );
//   vel = -200;
//   rad = -100;
//   setTimeout( function () {
//     vel = 4000;
//     rad = 0;
//   }, 1000 );
//       // }





////// LEFT  IR \\\\\\\

// Far left
// if ( response.payload.light_bumper_left > 0 ) {
//   console.log( response.payload +" = load" );
//   console.log('turning from Far Left');
//   console.log(arr);
//
//   // set boolean to true closure
//   var bool = true;
//   vel = 200;
//   rad = -70;
//   setTimeout( function () {
//     console.log('resuming from Far left');
//     bool = false;
//     vel = 1000;
//     rad = 0;
//     console.log('after interval' + arr);
//   }, 700 );
// }


//  Left center
// if ( response.payload.light_bumper_left_center > 0 ) {
//   console.log( response.payload );
//   vel = -200;
//   rad = -132;
//   setTimeout( function () {
//     vel = 4000;
//     rad = 0;
//   }, 1000 );
//
// }

// //  Left front
// if ( response.payload.light_bumper_left > 0 ) {
//   console.log( response.payload );
//   vel = -200;
//   rad = -100;
//   setTimeout( function () {
//     vel = 4000;
//     rad = 0;
//   }, 1000 );
//
// }

///////  BUMPERS  \\\\\\\\\
/*
    // bumper_left
    if ( response.payload.bumper_left > 0) {
      console.log( response.payload );
      vel = -2000;
      rad = -133;
      setTimeout( function () {
        vel = 4000;
        rad = 0;
      }, 1000 );
    }

    // bumper_right
    if ( response.payload.bumper_right > 0) {
      console.log( response.payload );
      vel = -2000;
      rad = 133;
      setTimeout( function () {
        vel = 4000;
        rad = 0;
      }, 1000 );
    }

*/








// if statements for obstacles
// acces sensor data

// function on.update do X
// Brian used a count with small increments, the count is higher depending on the severity


  // messages
  $(function() { // called when DOM is ready

    // establishes a socket.io connection
    var socket = io();

    socket.on('users', function(users) {
      console.log("users!: " + users);
    })

    // interface functions
    $('#event-button1').click(function() {
      socket.emit('event', 'webEvent1');
      console.log("webevent1 triggered");
      return false; // false does not reload the page
    });

    $('#event-button2').click(function() {
      socket.emit('event', 'webEvent2');
      console.log("webevent2 triggered");
      return false; // false does not reload the page
    });

    $('#event-button3').click(function() {
      socket.emit('event', 'webEvent3');
      console.log("webevent3 triggered");
      return false; // false does not reload the page
    });

    $('#event-button4').click(function() {
      socket.emit('event', 'webEvent4');
      console.log("webevent4 triggered");
      return false; // false does not reload the page
    });

    //

    $('#control-webSlider1').on('input', function() {
      var val = $('#control-webSlider1').val();
      $('#slider1-label').text(`control webSlider1 ${val}`);
      socket.emit('control', {header: 'webSlider1', values: val});
      console.log('control', {header: 'webSlider1', values: val});
      return false; // false does not reload the page
    });

    $('#control-webSlider2').on('input', function() {
      var val = $('#control-webSlider2').val();
      $('#slider2-label').text(`control webSlider2 ${val}`);
      socket.emit('control', {header: 'webSlider2', values: val});
      console.log('control', {header: 'webSlider2', values: val});
      return false; // false does not reload the page
    });

    $('#control-webSlider3').on('input', function() {
      var val = $('#control-webSlider3').val();
      $('#slider3-label').text(`control webSlider3 ${val}`);
      socket.emit('control', {header: 'webSlider3', values: val});
      console.log('control', {header: 'webSlider3', values: val});
      return false; // false does not reload the page
    });

    $('#control-webSlider4').on('input', function() {
      var val = $('#control-webSlider4').val();
      $('#slider4-label').text(`control webSlider4 ${val}`);
      socket.emit('control', {header: 'webSlider4', values: val});
      console.log('control', {header: 'webSlider4', values: val});
      return false; // false does not reload the page
    });

//

    $('#collectible-button').click(function() {
      socket.emit('spawnCollectible');
      console.log("spawning collectible");
      return false; // false does not reload the page
    });


    $('#dec-tempo').click(function() {
      socket.emit('decreaseTempo', socket.id);
      console.log("decreasing Tempo");
      return false; // false does not reload the page
    });

    $('#inc-tempo').click(function() {
      socket.emit('increaseTempo', socket.id);
      console.log("increasing Tempo");
      return false; // false does not reload the page
    });
});
// start slingin' some d3 here.

(function(){

  /*
  *
  * Initial variables
  *
  */

  var initialSettings = {
    width: 700,
    height: 400,
    stepInterval: 1500,
    currentScore: 0,
    highScore: 0,
    collisionCount: 0
  };

  /*
  *
  * Function factory
  *
  */

  var app = {

    // Sets random x-coordinate
    randomX: function() {
      return initialSettings.width * Math.random();
    },

    // Sets random y-coordinate
    randomY: function() {
      return initialSettings.height * Math.random();
    },

    // Creates a given number of enemies
    createEnemies: function(numEnemies) {
      return board.selectAll('.enemy')
        .data(d3.range(numEnemies))
        .enter()
        .append('circle')
        .attr({
          class: 'enemy', 
          cx: function(){
            return app.randomX();
          }, 
          cy: function(){
            return app.randomY();
          }, 
          r: 10})
        .style('fill', 'darkred');
        // .append('image')
        // .attr({x: function(){return app.randomX()}, y: function(){return app.randomY()}, width: '30px', height: '30px', 'xlink:href': 'shuriken.png'})
        // .style('fill', 'black');
    },

    // Transitions enemies to another random spot on the board
    randomStep: function() {
      enemies.transition()
        .duration(initialSettings.stepInterval)
        .attr({
          cx: function(){
            return app.randomX();
          }, 
          cy: function(){
            return app.randomY();
          }
        })
        // Listens for collisions during transitions
        .tween('collisionDetection', app.listenForCollision);
    },

    // Returns true when player collides with an enemy
    checkCollisionLogic: function(enemy){
      var enemyX = d3.select(enemy).attr('cx');
      var enemyY = d3.select(enemy).attr('cy');
      var playerX = player.attr('cx');
      var playerY = player.attr('cy');
      return Math.abs(enemyX - playerX) <= 20 &&
        Math.abs(enemyY - playerY) <= 20;
    },

    // Continuously listen for collisions during "tween" of transition
    listenForCollision: function(){
      // Check every millisecond for collisions
      var check = setInterval(app.responseToCollision.bind(this), 1);
      // Prevents setIntervals from building up
      setTimeout(function(){
        clearInterval(check);
      }, initialSettings.stepInterval);
    },

    // Response when collisions is detected
    responseToCollision: function(){
      // If there is a collision
      if(app.checkCollisionLogic(this)){

        app.updateHighScore();

        app.updateCollisionCount();

        app.resetEnemySpeedElement();

        app.resetCurrentScoreAndStepInterVal();
      
      }
    },

    // Reset current score to 0, reset stepInterval to 1500
    resetCurrentScoreAndStepInterVal: function() {
      initialSettings.currentScore = 0;
      d3.select('.current span').text(initialSettings.currentScore);
      initialSettings.stepInterval = 1500;
    },

    // Update if there is new high score
    updateHighScore: function() {
      // Update scoreboard if there is a new high score
      if(initialSettings.currentScore > initialSettings.highScore){
        initialSettings.highScore = initialSettings.currentScore;
        d3.select('.high span').text(initialSettings.highScore);
      }
    },

    // Update collision count
    updateCollisionCount: function() {
      if(initialSettings.currentScore > 10){
        initialSettings.collisionCount++;
        d3.select('.collisions span').text(initialSettings.collisionCount);
        app.changeBorderColor('red');
        // d3.select('.enemy-speed span').text(100);
        // d3.select('.enemy-speed').style('color', 'darkred');
      }
    },

    // Reset "Enemy Speed" element to 100% and dark red
    resetEnemySpeedElement: function() {
      d3.select('.enemy-speed span').text(100);
      d3.select('.enemy-speed').style('color', 'darkred');
    },

    // Creates a green orb that slows down enemies
    createBulletTime: function(){
      return board.append('circle')
        .attr({
          // Class used to remove orb later when collected
          class: 'bullet-time-board', 
          cx: function(){
            return app.randomX();
          }, 
          cy: function(){
            return app.randomY()
          }, 
          r: 10
        })
        .style('fill', 'lightgreen');
    },

    // Update step interval when green orb is collected
    // and when player loses
    listenForStepIntervalChanges: function(interval){
      setTimeout(function(){
        app.randomStep();
        app.listenForStepIntervalChanges(initialSettings.stepInterval);
      }, interval);
    },

    // Change border color on event
    changeBorderColor: function(color, wait){
      wait = wait || 1000;

      board.style('border', '10px solid ' + color);
      setTimeout(function(){
        board.style('border', '10px solid black');
      }, wait);
    },

    // Listen for new high score
    listenForNewHighScore: function() {
      setInterval(function(){
        initialSettings.currentScore++;
        if(initialSettings.currentScore === initialSettings.highScore){
          app.changeBorderColor('gold', 1500);
          board.append('text')
            .attr({
              x: '86px', 
              y: '180px', 
              class: 'new-high-score'
            })
            .style({
              'font-size': '80px', 
              'font-weight':'bold', 
              'letter-spacing': '-6px', 
              'opacity':'0.3', 
              'fill': 'gold'
            })
            .text('New High Score');
        setTimeout(function(){
          board.selectAll('.new-high-score').data([]).exit().remove();
        }, 1500);
        }
        d3.select('.current span').text(initialSettings.currentScore);
      }, 50);
    }

  };

  /*
  *
  * Customize number of enemies on the board
  *
  */
  var submitButton = d3.select('.submit');
  // Initialize number of enemies to 15
  var numEnemies = 15;
  submitButton.on('click', function() {
    // Get input value from DOM
    numEnemies = document.getElementById('numberOfEnemies').value;
    // Remove all enemies from the board
    board.selectAll('.enemy').data([]).exit().remove();
    // Call createEnemies to repopulate board with new number of enemies
    enemies = app.createEnemies(numEnemies);
  });

  /*
  *
  * Initialize game board
  *
  */

  var board = d3.select('#board')
                .append('svg')
                .attr({
                  width: initialSettings.width + 'px', 
                  height: initialSettings.height + 'px'
                })
                .style('border', '10px solid black');


  

  

  var enemies = app.createEnemies(numEnemies);

  var bulletTime = app.createBulletTime();

  var drag = d3.behavior.drag().on('drag', function(){
    var x = d3.event.x;
    var y = d3.event.y;

    if(x > initialSettings.width){
      x = 690;
    }
    if(x < 0){
      x = 10;
    }
    if(y > initialSettings.height){
      y = 390;
    }
    if(y < 0){
      y = 10;
    }
    if (Math.abs(x - bulletTime.attr('cx')) <= 20 && Math.abs(y - bulletTime.attr('cy')) <= 20) {
      initialSettings.stepInterval += 250;
      board.selectAll('.bullet-time-board').data([]).exit().remove();
      bulletTime = app.createBulletTime();
      app.changeBorderColor('lightgreen');
      var percentage = Math.floor((1500 / initialSettings.stepInterval) * 100);
      d3.select('.enemy-speed span').text(percentage);
      d3.select('.enemy-speed').style('color', 'lightgreen');
    }
    player.attr({cx: x, cy: y});
  });

  var player = board.append('circle')
                  .attr({
                    cx: '350',
                    cy: '200',
                    r: '10'
                  })
                  .style('fill', 'steelblue')
                  .call(drag);

  app.listenForStepIntervalChanges(initialSettings.stepInterval);

  app.listenForNewHighScore();

})();


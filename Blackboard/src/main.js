import * as THREE from 'three';

import './main.css';

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
var canvas;
var canvasContent;

var chalkWidth = 50;
var chalkHeight = 50;

var mouseState = false;

var MouseX, MouseY;
var CenterX, CenterY;

var PrevX, PrevY;

var BoardImage;
var ChalkImage;

window.addEventListener('resize', resizeCanvas, false);
document.addEventListener('resize', resizeCanvas, false);

function loadChalkImage () {
  ChalkImage = this;
}

function loadBoardImage () {
  BoardImage = this;
  canvasContent.drawImage(this, 0, 0, window.innerWidth, window.innerHeight);
}

function Draw () {
  if (ChalkImage === undefined) {
    return;
  }
  if (mouseState) {
    var dMouseX = Math.abs(PrevX - MouseX);
    var dMouseY = Math.abs(PrevY - MouseY);

    if (dMouseX > Math.min(chalkWidth, chalkHeight) / 2 || dMouseY > Math.min(chalkWidth, chalkHeight) / 2) {
      var t = Math.ceil(Math.max(dMouseX, dMouseY) / Math.min(chalkWidth, chalkHeight)) * 2;
      var CurX = PrevX;
      var CurY = PrevY;
      var dx = dMouseX / t * Math.sign(MouseX - PrevX);
      var dy = dMouseY / t * Math.sign(MouseY - PrevY);
      for (let i = 0; i < t; i++, CurX += dx, CurY += dy) {
        canvasContent.drawImage(ChalkImage, CurX - chalkWidth / 2, CurY - chalkHeight / 2, chalkWidth, chalkHeight);
      }
    } else {
      canvasContent.drawImage(ChalkImage, MouseX - chalkWidth / 2, MouseY - chalkHeight / 2, chalkWidth, chalkHeight);
    }
    PrevX = MouseX;
    PrevY = MouseY;
  }
}

function resizeCanvas () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (BoardImage !== undefined) {
    canvasContent.drawImage(BoardImage, 0, 0, window.innerWidth, window.innerHeight);
  }
  animate();
}

function init () {
  CanvasInit();
  ImagesInit();
  resizeCanvas();
  animate();
}

function CanvasInit () {
  canvas = document.getElementById('MainCanvas');
  canvasContent = canvas.getContext('2d');
  canvas.addEventListener('mousedown', function (event) {
    mouseState = true;
  });
  canvas.addEventListener('mouseup', function (event) {
    mouseState = false;
    PrevX = undefined;
    PrevY = undefined;
  });
  canvas.addEventListener('mousemove', function (event) {
    MouseX = event.clientX;
    MouseY = event.clientY;
  });
  canvas.addEventListener('wheel', function (event) {
    var scroll = event.deltaY;
    if (Math.sign(scroll) < 0) {
      chalkHeight *= 2;
      chalkWidth *= 2;
    } else {
      chalkHeight /= 2;
      chalkWidth /= 2;
    }
  });
  document.addEventListener('keydown', function (event) {
    var ChalkImage;
    switch (event.keyCode) {
      case 49 :
        ChalkImage = new Image();
        ChalkImage.onload = loadChalkImage;
        ChalkImage.src = '../bin/images/chalk.png';
        return;
      case 50 :
        ChalkImage = new Image();
        ChalkImage.onload = loadChalkImage;
        ChalkImage.src = '../bin/images/marker.png';
    }
  });
}

function ImagesInit () {
  var ChalkImage = new Image();
  ChalkImage.onload = loadChalkImage;
  ChalkImage.src = '../bin/images/marker.png';

  var BoardImage = new Image();
  BoardImage.onload = loadBoardImage;
  BoardImage.src = '../bin/images/board.jpg';
}

function animate () {
  requestAnimationFrame(animate);
  Draw();
}

window.onload = init;

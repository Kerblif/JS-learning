import * as THREE from 'three';
import { saveAs } from 'file-saver';

import './main.css';

var fs = require('browserify-fs');

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
var canvas;
var canvasContent;

var chalkWidth = 50;
var chalkHeight = 50;

var mouseLState = false;
var mouseRState = false;
var mouseMState = false;

var MouseX, MouseY;

var PrevX, PrevY;

var BoardImage;
var ChalkImage;

function getBase64Image () {
  return canvas.toDataURL('image/png');
}

function getCookie (name) {
  const matches = document.cookie.match(new RegExp(
    '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie (name, value, options = {}) {
  options = {
    path: '/',
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (const optionKey in options) {
    updatedCookie += '; ' + optionKey;
    const optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += '=' + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie (name) {
  setCookie(name, '', {
    'max-age': -1
  });
}

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

  var dMouseX, dMouseY;
  var t, CurX, CurY, dx, dy, coefW, coefH;
  var data;

  if (mouseLState) {
    dMouseX = Math.abs(PrevX - MouseX);
    dMouseY = Math.abs(PrevY - MouseY);

    if (dMouseX > Math.min(chalkWidth, chalkHeight) / 2 || dMouseY > Math.min(chalkWidth, chalkHeight) / 2) {
      t = Math.ceil(Math.max(dMouseX, dMouseY) / Math.min(chalkWidth, chalkHeight)) * 2;
      CurX = PrevX;
      CurY = PrevY;
      dx = dMouseX / t * Math.sign(MouseX - PrevX);
      dy = dMouseY / t * Math.sign(MouseY - PrevY);
      for (let i = 0; i < t; i++, CurX += dx, CurY += dy) {
        canvasContent.drawImage(ChalkImage, CurX - chalkWidth / 2, CurY - chalkHeight / 2, chalkWidth, chalkHeight);
      }
    } else {
      canvasContent.drawImage(ChalkImage, MouseX - chalkWidth / 2, MouseY - chalkHeight / 2, chalkWidth, chalkHeight);
    }
    PrevX = MouseX;
    PrevY = MouseY;
  }
  if (mouseRState) {
    dMouseX = Math.abs(PrevX - MouseX);
    dMouseY = Math.abs(PrevY - MouseY);

    coefW = BoardImage.width / canvas.width;
    coefH = BoardImage.height / canvas.height;

    if (dMouseX > Math.min(chalkWidth, chalkHeight) / 2 || dMouseY > Math.min(chalkWidth, chalkHeight) / 2) {
      t = Math.ceil(Math.max(dMouseX, dMouseY) / Math.min(chalkWidth, chalkHeight)) * 2;
      CurX = PrevX;
      CurY = PrevY;
      dx = dMouseX / t * Math.sign(MouseX - PrevX);
      dy = dMouseY / t * Math.sign(MouseY - PrevY);
      for (let i = 0; i < t; i++, CurX += dx, CurY += dy) {
        canvasContent.drawImage(
          BoardImage,
          (CurX - chalkWidth / 2) * coefW, (CurY - chalkHeight / 2) * coefH,
          chalkWidth * coefW, chalkHeight * coefH,
          CurX - chalkWidth / 2, CurY - chalkHeight / 2, chalkWidth, chalkHeight
        );
      }
    } else {
      canvasContent.drawImage(
        BoardImage,
        (MouseX - chalkWidth / 2) * coefW, (MouseY - chalkHeight / 2) * coefH,
        chalkWidth * coefW, chalkHeight * coefH,
        MouseX - chalkWidth / 2, MouseY - chalkHeight / 2, chalkWidth, chalkHeight
      );
    }
    PrevX = MouseX;
    PrevY = MouseY;
  }
}

function resizeCanvas () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = 512;
  canvas.height = 300;
}

function autoSave () {
  loadImageToFile();
  setTimeout(autoSave, 5000);
}

function init () {
  if (getCookie('info') == undefined) {
    alert('I - информация о управлении');
    setCookie('info', true);
  }
  CanvasInit();
  ImagesInit();
  resizeCanvas();
  autoSave();
  animate();
}

function loadImageToFile () {
  var data = getBase64Image();

  fs.writeFile('./BlackboardData.txt', data, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

function loadImageFromFile () {
  fs.readFile('./BlackboardData.txt', 'utf8', (err, data) => {
    if (err) throw err;

    var image = new Image();
    image.src = data;
    image.onload = function () {
      canvasContent.drawImage(this, 0, 0, canvas.width, canvas.height);
    };
  });
}

function CanvasInit () {
  canvas = document.getElementById('MainCanvas');
  canvasContent = canvas.getContext('2d');
  loadImageFromFile();
  canvas.addEventListener('mousedown', function (event) {
    if (event.which === 1) {
      mouseLState = true;
    }
    if (event.which === 2) {
      mouseMState = true;
    }
    if (event.which === 3) {
      mouseRState = true;
    }
  });
  canvas.addEventListener('mouseup', function (event) {
    if (event.which === 1) {
      mouseLState = false;
    }
    if (event.which === 2) {
      mouseMState = false;
    }
    if (event.which === 3) {
      mouseRState = false;
    }
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
    var LoadChalkImage;
    switch (event.keyCode) {
      case 49 :
        LoadChalkImage = new Image();
        LoadChalkImage.onload = loadChalkImage;
        LoadChalkImage.src = '../bin/images/chalk.png';
        break;
      case 50 :
        LoadChalkImage = new Image();
        LoadChalkImage.onload = loadChalkImage;
        LoadChalkImage.src = '../bin/images/marker.png';
        break;
      case 83:
        canvas.toBlob(function (blob) {
          setCookie('image', blob);
          saveAs(blob, 'blackboard.png');
        });
        break;
      case 73:
        alert('ЛКМ - рисовать. \nПКМ - стирать. \nКолесо мыши - увеличение/уменьшение кисти \nЦифра 1 - мелок \nЦифра 2 - маркер (по умолчанию)\nS - сохранить ваш шедевр (в виде файла)');
        alert('Также сохранение изображения автоматичесокое (раз в 5 секунд)');
        break;
      case 13:
        loadImageToFile();
        break;
      case 17:
        loadImageFromFile();
    }
  });
}

function ImagesInit () {
  var LoadChalkImage = new Image();
  LoadChalkImage.onload = loadChalkImage;
  LoadChalkImage.src = '../bin/images/marker.png';

  var LoadBoardImage = new Image();
  LoadBoardImage.onload = loadBoardImage;
  LoadBoardImage.src = '../bin/images/board.jpg';
}

function animate () {
  requestAnimationFrame(animate);
  Draw();
}

window.onload = init;

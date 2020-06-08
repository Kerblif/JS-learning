import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import './main.css';

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
var scene;
var renderer;

class Contrl {
  constructor () {
    this.PressKeys = {
      0: false
    };
    this.KeyPressed = function (event) {
      switch (event.keyCode) {
        case 100: /* d */
          Car.scene.position.x -= 4;
          camera.position.x -= 4;
          break;
        case 68: /* D */
          camera.position.x += 4;
          break;
        case 97: /* a */
          Car.scene.position.x += 4;
          camera.position.x += 4;
          break;
        case 65: /* A */
          camera.position.x -= 4;
          break;
        case 115: /* s */
          Car.scene.position.z -= 4;
          camera.position.z -= 4;
          break;
        case 83: /* S */
          camera.position.z += 4;
          break;
        case 119: /* w */
          Car.scene.position.z += 4;
          camera.position.z += 4;
          break;
        case 87: /* W */
          camera.position.z -= 4;
          break;
      }
      updateCar();
    };
    this.GetKey = function (key) {
      return this.PressKeys[key];
    };
    this.RotateCamera = function () {
    };
  }
}

function updateCar () {
  var CarPos = Car.scene.position;
  var PosOnLand = 450 * (225 + CarPos.z / 4) + 225 + CarPos.x / 4;

  var val = HeightData[PosOnLand];

  var delta = Car.scene.position.y - val;

  Car.scene.position.y = val;
  camera.position.y -= delta;
}

var canvas = document.getElementById('MainCanvas');
var Keyboard = new Contrl();
var Car;
var HeightData;
var texture;
var mesh;
var light;

window.addEventListener('resize', resizeCanvas, false);
document.addEventListener('resize', resizeCanvas, false);

function resizeCanvas () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  animate();
}

init();
resizeCanvas();
animate();

function CarLoad () {
  var loader = new GLTFLoader();
  loader.load('../bin/models/Car/scene.gltf', function (object) {
    Car = object;
    Car.scene.traverse(function (object) {
      if (object.isMesh) {
        object.castShadow = true;
      }
    });
    scene.add(Car.scene);
  }, undefined, function (error) {
    alert(error);
  });
}

function getHeightData (name) {
  var loader = new THREE.ImageLoader();

  loader.load(
    '../bin/images/' + name,
    function (img) {
      var canvas = document.createElement('canvas');
      canvas.width = 450;
      canvas.height = 450;
      var context = canvas.getContext('2d');

      var size = 450 * 450; var data = new Float32Array(size);

      context.drawImage(img, 0, 0);

      for (var i = 0; i < size; i++) {
        data[i] = 0;
      }

      var imgd = context.getImageData(0, 0, 450, 450);
      var pix = imgd.data;

      var j = 0;
      for (var i = 0, n = pix.length; i < n; i += (4)) {
        var all = pix[i] + pix[i + 1] + pix[i + 2];
        data[j++] = all / 30;
      }

      var val = data[225 * 451];

      for (var i = 0; i < 450 * 450; i++) {
        data[i] -= val;
      }

      HeightData = data;
      GenerateLandscape();
      mesh.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
      });
      mesh.receiveShadow = true;
      scene.add(mesh);
    },
    undefined,
    function () {
      alert('An error in height map load happened.');
    }
  );
}

function generateTexture (data, width, height) {
  var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

  vector3 = new THREE.Vector3(0, 0, 0);

  sun = light.position;
  sun.normalize();

  canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext('2d');
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    shade = vector3.dot(sun);

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
    imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);

  // Scaled 4x

  canvasScaled = document.createElement('canvas');
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext('2d');
  context.scale(4, 4);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  for (var i = 0, l = imageData.length; i < l; i += 4) {
    var v = ~~(Math.random() * 5);

    imageData[i] += v;
    imageData[i + 1] += v;
    imageData[i + 2] += v;
  }

  context.putImageData(image, 0, 0);

  return canvasScaled;
}

function GenerateLandscape () {
  var data = HeightData;

  var geometry = new THREE.PlaneBufferGeometry(1800, 1800, 449, 449);
  geometry.rotateX(-Math.PI / 2);

  var vertices = geometry.attributes.position.array;

  for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i];
  }

  texture = new THREE.CanvasTexture(generateTexture(data, 450, 450));
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
}

function DirectionLightCreate () {
  const color = 0xFFFFFF;
  const intensity = 1;
  light = new THREE.DirectionalLight(color, intensity);
  light.position.set(10, 0, 10);
  light.target.position.set(-5, -5, 0);

  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 5000;
  light.shadow.camera.left = -100;
  light.shadow.camera.bottom = -100;
  light.shadow.camera.right = 100;
  light.shadow.camera.top = 100;

  light.castShadow = true;
  scene.add(light);
  var helper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(helper);
}

function init () {
  document.addEventListener('keypress', Keyboard.KeyPressed);
  camera.position.y = 5;

  scene = new THREE.Scene();

  CarLoad();

  DirectionLightCreate();

  getHeightData('tex.jpg');

  renderer = new THREE.WebGLRenderer({ canvas: MainCanvas });

  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.shadowCameraNear = 3;
  renderer.shadowCameraFar = camera.far;
  renderer.shadowCameraFov = 50;

  renderer.shadowMapBias = 0.0039;
  renderer.shadowMapDarkness = 0.5;
  renderer.shadowMapWidth = 1024;
  renderer.shadowMapHeight = 1024;

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate () {
  requestAnimationFrame(animate);
  updateCamera();
  renderer.render(scene, camera);
}

function updateCamera () {
  if (Car != undefined) {
    camera.lookAt(Car.scene.position);
  }
}

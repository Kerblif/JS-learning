import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import vxShader from './main.vert';
import fsShader from './main.frag';

import heightmap from '../bin/images/tex.png';

import dirtTex from '../bin/images/landscape/dirt.jpg';
import oceanTex from '../bin/images/landscape/water.jpg';
import sandTex from '../bin/images/landscape/sand.jpg';
import grassTex from '../bin/images/landscape/grass.jpg';
import rockTex from '../bin/images/landscape/rock.jpg';
import snowTex from '../bin/images/landscape/snow.jpg';

import './main.css';

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
var scene;
var renderer;

var meshes = [];
var phara;
var time;
var speed = 0;

var Angle = 0;
var PressedKeys = {};

var canvas = document.getElementById('MainCanvas');
var Car;
var HeightData;
var mesh;
var light;

var particles = [];
var numOfParticles = 200;

var NeedHeight = 10;

var clock = new THREE.Clock();

window.addEventListener('resize', resizeCanvas, false);
document.addEventListener('resize', resizeCanvas, false);

function KeyDown (event) {
  if (PressedKeys == undefined) {
    PressedKeys = {};
  }
  PressedKeys[event.keyCode] = true;
}

function KeyUp (event) {
  if (PressedKeys == undefined) {
    PressedKeys = {};
  }
  PressedKeys[event.keyCode] = false;
}

function GetKey (key) {
  return PressedKeys[key];
}

function Control () {
  if (time % 1 == 0) {
    return;
  }
  if (Car == undefined) {
    return;
  }
  if (GetKey(39)) {
    camera.position.x += 1;
  }
  if (GetKey(37)) {
    camera.position.x -= 1;
  }
  if (GetKey(38)) {
    camera.position.z -= 1;
  }
  if (GetKey(40)) {
    camera.position.z += 1;
  }
  if (GetKey(33)) {
    NeedHeight += 1;
  }
  if (GetKey(34)) {
    NeedHeight -= 1;
  }
  if (GetKey(87)) {
    if (GetKey(65)) {
      if (Angle == undefined) {
        Angle = 0;
      }
      Angle += 0.01;
      CarRotate(Angle);
    } else {
      if (GetKey(68)) {
        if (Angle == undefined) {
          Angle = 0;
        }
        Angle -= 0.01;
        CarRotate(Angle);
      }
    }
    if (Angle == undefined) {
      Angle = 0;
    }
    if (speed < 0) {
      speed += 0.005;
    }
    speed += 0.001;
    WheelsRotate(0.2);
  } else {
    if (GetKey(83)) {
      if (GetKey(68)) {
        if (Angle == undefined) {
          Angle = 0;
        }
        Angle += 0.01;
        CarRotate(Angle);
      } else {
        if (GetKey(65)) {
          if (Angle == undefined) {
            Angle = 0;
          }
          Angle -= 0.01;
          CarRotate(Angle);
        }
      }
      if (Angle == undefined) {
        Angle = 0;
      }
      if (speed > 0) {
        speed -= 0.005;
      }
      speed -= 0.001;
      WheelsRotate(-0.2);
    } else {
      if (speed == 0) {
        return;
      }
      if (Math.abs(speed) < 0.07) {
        speed = 0;
        return;
      }
      if (speed > 0) {
        if (GetKey(65)) {
          if (Angle == undefined) {
            Angle = 0;
          }
          Angle += 0.01;
          CarRotate(Angle);
        } else {
          if (GetKey(68)) {
            if (Angle == undefined) {
              Angle = 0;
            }
            Angle -= 0.01;
            CarRotate(Angle);
          }
        }
        speed -= 0.005;
      } else {
        if (GetKey(68)) {
          if (Angle == undefined) {
            Angle = 0;
          }
          Angle += 0.01;
          CarRotate(Angle);
        } else {
          if (GetKey(65)) {
            if (Angle == undefined) {
              Angle = 0;
            }
            Angle -= 0.01;
            CarRotate(Angle);
          }
        }
        speed += 0.005;
      }
    }
  }
  MoveCar(Math.sin(Angle) * speed, Math.cos(Angle) * speed);
}

function WheelsRotate (deg) {
  meshes[5].rotation.x += deg;
  meshes[6].rotation.x += deg;
  meshes[7].rotation.x += deg;
  meshes[8].rotation.x += deg;
  meshes[9].rotation.x += deg;
  meshes[10].rotation.x += deg;
  meshes[11].rotation.x += deg;
  meshes[12].rotation.x += deg;
}

function CarRotate (deg) {
  Car.scene.rotation.y = deg;
}

function MoveCar (x, z) {
  Car.scene.position.x += x;
  camera.position.x += x;
  Car.scene.position.z += z;
  camera.position.z += z;

  updateCar();
}

function GetPosOnLand (x, z) {
  return 512 * (256 + z) + 256 + x;
}

function updateCar () {
  if (HeightData == undefined) {
    return;
  }
  var CarPos = Car.scene.position;
  var PosX = CarPos.x / 4;
  var PosZ = CarPos.z / 4;
  var val = HeightData[GetPosOnLand(Math.round(PosX), Math.round(PosZ))];
  val *= 3;

  Car.scene.position.y = val;

  var CameraPos = camera.position;
  PosX = CameraPos.x / 4;
  PosZ = CameraPos.z / 4;
  val = HeightData[GetPosOnLand(Math.round(PosX), Math.round(PosZ))];
  val *= 3;

  camera.position.y = val + NeedHeight;
}

function resizeCanvas () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  animate();
}

function CarLoad () {
  var loader = new GLTFLoader();
  loader.load('../bin/models/Car2/scene.gltf', function (object) {
    Car = object;

    Car.scene.traverse(function (object) {
      if (object.isMesh) {
        object.material.color.convertLinearToGamma(2.0);
        meshes.push(object);
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    scene.add(Car.scene);
    const color = 0xFFFFFF;
    const intensity = 100;
    const width = 1.3;
    const height = 0.5;
    phara = new THREE.RectAreaLight(color, intensity, width, height);
    phara.position.set(0, 0.8, 2.3);
    phara.rotation.x = THREE.MathUtils.degToRad(180);
    Car.scene.add(phara);
    Car.castShadow = true;
    Car.receiveShadow = true;
    updateCar();
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
      canvas.width = 512;
      canvas.height = 512;
      var context = canvas.getContext('2d');

      var size = 512 * 512; var data = new Float32Array(size);

      context.drawImage(img, 0, 0);

      for (var i = 0; i < size; i++) {
        data[i] = 0;
      }

      var imgd = context.getImageData(0, 0, 512, 512);
      var pix = imgd.data;

      var j = 0;
      for (var i = 0, n = pix.length; i < n; i += (4)) {
        var all = pix[i] + pix[i + 1] + pix[i + 2];
        data[j++] = all / 30;
      }

      HeightData = data;
      GenerateLandscape();
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

  var geometry = new THREE.PlaneBufferGeometry(2048, 2048, 511, 511);
  geometry.rotateX(-Math.PI / 2);

  var vertices = geometry.attributes.position.array;

  for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * 3;
  }

  var texture = new THREE.CanvasTexture(generateTexture(data, 450, 450));
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }));
  mesh.receiveShadow = true;
}

function DirectionLightCreate () {
  const color = 0xFFFFFF;
  const intensity = 1;
  light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 100, 0);
  light.target.position.set(0, 0, 0);

  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500;
  light.shadow.camera.left = -5;
  light.shadow.camera.bottom = -5;
  light.shadow.camera.right = 5;
  light.shadow.camera.top = 5;

  light.castShadow = true;
  scene.add(light);
}

function addWater (height) {
  const pGeo = new THREE.PlaneGeometry(2048, 2048, 1, 1);
  const waterTex = new THREE.TextureLoader().load(oceanTex);
  waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
  waterTex.repeat.set(5, 5);
  const waterMat = new THREE.MeshBasicMaterial({ map: waterTex, transparent: true, opacity: 0.40 });
  waterMat.color.convertLinearToGamma(2.0);
  const water = new THREE.Mesh(pGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = height;
  scene.add(water);
}

function addParticles (particles) {
  var loader = new THREE.TextureLoader();
  loader.load('../bin/images/cloud.png', function (texture) {
    for (let t = 0; t < numOfParticles; t++) {
      var cloudGeom = new THREE.PlaneBufferGeometry(2, 2);
      var cloudMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const cloud = new THREE.Mesh(cloudGeom, cloudMaterial);
      cloud.position.x = 0;
      cloud.position.y = 0;
      cloud.position.z = 0;
      cloud.material.opacity = Math.random() / 10;
      particles.push(cloud);
      scene.add(cloud);
    }
  });
}

function init () {
  time = 50;
  document.addEventListener('keydown', KeyDown);
  document.addEventListener('keyup', KeyUp);

  scene = new THREE.Scene();
  scene.background = new THREE.Color();

  CarLoad();

  addParticles(particles);

  DirectionLightCreate();

  getHeightData('tex.png');
  addWater(25.69);

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

function SetSky () {
  var y, w;

  if (time < 25 || time >= 175) {
    y = (100.0 - Math.abs(100.0 - time)) / 25.0;
  } else {
    y = 1;
  }
  if (time >= 25 && time < 175) {
    w = (75.0 - Math.abs(100.0 - time)) / 50.0;
    if (w > 1) {
      w = 1;
    }
  } else {
    w = 0;
  }
  light.color.r = (y * 200.0 + w * 55.0) / 255.0;
  light.color.g = (y * 120.0 + w * 135.0) / 255.0;
  light.color.b = (y * 50.0 + w * 205.0) / 255.0;

  scene.background = light.color;
}

function animate () {
  requestAnimationFrame(animate);

  time += clock.getDelta();

  if (time >= 200) {
    time = 0;
  }
  SetSky();
  Control();
  updateScene(clock.getDelta());
  renderer.render(scene, camera);
}

function updateScene (now) {
  if (Car != undefined) {
    var pos = Car.scene.position;

    particles.forEach(function (particle) {
      particle.lookAt(camera.position);
      if (particle.material.opacity <= 0.1) {
        particle.position.set(pos.x, pos.y, pos.z);
        particle.material.opacity = Math.random() / 2;
      } else {
        particle.material.opacity -= now * 100;
        particle.position.y += now * 100;
      }
    });

    light.target.position.set(pos.x, pos.y, pos.z);
    light.position.set(pos.x + (time - 100) * 5, pos.y + 100, pos.z);
    light.target.updateMatrixWorld();
    camera.lookAt(Car.scene.position);
  }
}

init();
resizeCanvas();
animate();

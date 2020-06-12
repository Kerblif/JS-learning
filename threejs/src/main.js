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

function ChangeScene () {
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
    camera.position.y += 1;
  }
  if (GetKey(34)) {
    camera.position.y -= 1;
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
      speed += 0.05;
    }
    speed += 0.01;
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
        speed -= 0.05;
      }
      speed -= 0.01;
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
        speed -= 0.05;
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
        speed += 0.05;
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
  var CarPos = Car.scene.position;
  var PosX = CarPos.x / 4;
  var PosZ = CarPos.z / 4;
  var Dx = Math.abs(PosX % 1);
  var Dz = Math.abs(PosZ % 1);
  var val =
  HeightData[GetPosOnLand(Math.floor(PosX), Math.floor(PosZ))] * Dx * Dz +
  HeightData[GetPosOnLand(Math.floor(PosX), Math.ceil(PosZ))] * Dx * (1 - Dz) +
  HeightData[GetPosOnLand(Math.ceil(PosX), Math.floor(PosZ))] * (1 - Dx) * Dz +
  HeightData[GetPosOnLand(Math.ceil(PosX), Math.ceil(PosZ))] * (1 - Dx) * (1 - Dz);
  val *= 3;

  var delta = Car.scene.position.y - val;

  Car.scene.position.y = val;
  camera.position.y -= delta;
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

function generateMaterial () {
  const bumpTexture = new THREE.TextureLoader().load(heightmap);
  bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;

  const oceanTexture = new THREE.TextureLoader().load(dirtTex);
  oceanTexture.wrapS = oceanTexture.wrapT = THREE.RepeatWrapping;

  const sandyTexture = new THREE.TextureLoader().load(sandTex);
  sandyTexture.wrapS = sandyTexture.wrapT = THREE.RepeatWrapping;

  const grassTexture = new THREE.TextureLoader().load(grassTex);
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;

  const rockyTexture = new THREE.TextureLoader().load(rockTex);
  rockyTexture.wrapS = rockyTexture.wrapT = THREE.RepeatWrapping;

  const snowyTexture = new THREE.TextureLoader().load(snowTex);
  snowyTexture.wrapS = snowyTexture.wrapT = THREE.RepeatWrapping;

  var heightMapUniforms = {
    bumpTexture: { type: 't', value: bumpTexture },
    oceanTexture: { type: 't', value: oceanTexture },
    sandyTexture: { type: 't', value: sandyTexture },
    grassTexture: { type: 't', value: grassTexture },
    rockyTexture: { type: 't', value: rockyTexture },
    snowyTexture: { type: 't', value: snowyTexture }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: heightMapUniforms,
    vertexShader: vxShader,
    fragmentShader: fsShader,
    side: THREE.DoubleSide
  });
  return mat;
}

function GenerateLandscape () {
  var data = HeightData;

  var geometry = new THREE.PlaneBufferGeometry(2048, 2048, 511, 511);
  geometry.rotateX(-Math.PI / 2);

  var vertices = geometry.attributes.position.array;

  for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * 3;
  }

  mesh = new THREE.Mesh(geometry, generateMaterial());
  mesh.receiveShadow = true;
}

function DirectionLightCreate () {
  const color = 0xFFFFFF;
  const intensity = 1;
  light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 100, 0);
  light.target.position.set(0, 0, 0);

  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 5000;
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
  const water = new THREE.Mesh(pGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = height;
  scene.add(water);
}

function init () {
  time = 0;
  document.addEventListener('keydown', KeyDown);
  document.addEventListener('keyup', KeyUp);
  camera.position.y = 5;

  scene = new THREE.Scene();
  scene.background = new THREE.Color();

  CarLoad();

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
  if (time < 100) {
    scene.background.r = time / 100;
    scene.background.g = time / 100;
    scene.background.b = time / 100;
    light.intensity = time / 100;
  } else {
    scene.background.r = 1 - (time - 100) / 100;
    scene.background.g = 1 - (time - 100) / 100;
    scene.background.b = 1 - (time - 100) / 100;
    light.intensity = 1 - (time - 100) / 100;
  }
}

function animate () {
  requestAnimationFrame(animate);
  time += 0.1;
  if (time >= 200) {
    time = 0;
  }
  SetSky();
  ChangeScene();
  updateCamera();
  renderer.render(scene, camera);
}

function updateCamera () {
  if (Car != undefined) {
    var pos = Car.scene.position;
    light.target.position.set(pos.x, pos.y - 100, pos.z);
    light.position.set(pos.x, pos.y + 100, pos.z);
    light.target.updateMatrixWorld();
    camera.lookAt(Car.scene.position);
  }
}

init();
resizeCanvas();
animate();

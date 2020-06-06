import * as THREE from 'three'
import Image from './tex.jpg'

import './main.css'

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
var scene
var renderer

class Contrl {
  constructor () {
    this.PressKeys = {
      0: false
    }
    this.KeyPressed = function (event) {
      switch (event.keyCode) {
        case 100: /* w */
        case 68: /* W */
          camera.position.x += 0.5
          break
        case 97: /* a */
        case 65: /* A */
          camera.position.x -= 0.5
          break
        case 115: /* s */
        case 83: /* S */
          camera.position.z += 0.5
          break
        case 119: /* w */
        case 87: /* W */
          camera.position.z -= 0.5
          break
      }
    }
    this.GetKey = function (key) {
      return this.PressKeys[key]
    }
    this.RotateCamera = function () {
    }
  }
}

var Grid
var canvas = document.getElementById('MainCanvas')
var Keyboard = new Contrl()

window.addEventListener('resize', resizeCanvas, false)
document.addEventListener('resize', resizeCanvas, false)

function resizeCanvas () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  animate()
}

init()
resizeCanvas()
animate()

function init () {
  Keyboard.PressKeys = {
    0: false
  }
  document.addEventListener('keypress', Keyboard.KeyPressed)
  camera.position.y = 5

  scene = new THREE.Scene()

  Grid = new THREE.GridHelper(128, 128)
  scene.add(Grid)

  renderer = new THREE.WebGLRenderer({ canvas: MainCanvas })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
}

function animate () {
  requestAnimationFrame(animate)
  updateCamera()
  renderer.render(scene, camera)
}

function updateCamera () {
}

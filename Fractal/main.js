'use strict'

const vxShaderStr =
  `#version 300 es
in vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

out vec2 vTextureCoord;

void main(void)
{
    vec4 pos = vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uMVMatrix * pos;
}
`

const fsShaderStr =
  `#version 300 es
precision highp float;

uniform float uCellWidth;
uniform float uTime;

uniform float offX, offY, zoom;
uniform sampler2D Tex2D;

uniform float param3, param4;

out vec4 oColor;

vec2 vec2addvec2(vec2 a, vec2 b)
{
    return vec2(a.x + b.x, a.y + b.y);
}
vec2 vec2mulvec2(vec2 a, vec2 b)
{
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}
float vec2abs(vec2 a)
{
    return sqrt(a.x * a.x + a.y * a.y);
}
float vec2rec(vec2 xy)
{
    vec2 z = xy;
    float i;
    while (vec2abs(z) < 2.0 && i < 2000.0)
    {
      i++;
      z = vec2addvec2(vec2mulvec2(z, z), xy);
    }
    return i;
}
void main(void)
{
    vec2 xy = vec2(gl_FragCoord) / 500.0;
    xy.x -= 0.5 + offX;
    xy.y -= 0.5 + offY;
    xy /= zoom;
    float i = vec2rec(xy);
    vec3 frac = vec3(1.0 - (i * 12.2324 / 13.7898 + 1072.54) / 2000.0 + param3 / 100.0, (i * 45.9766 / 54.7898 + 960.14) / 2000.0 + param3 / 100.0, (i + 1000.0) / 2000.0 + param3 / 100.0);
    oColor = texture(Tex2D, frac.xy + param4 / 1000.0);
}`

var gl

function initGL (canvas) {
  try {
    gl = canvas.getContext('webgl2')
    gl.viewportWidth = canvas.width
    gl.viewportHeight = canvas.height
  } catch (e) {}
  if (!gl) {
    alert('Could not initialize WebGL')
  }
}

var Store = function () {
  this.param = new Array()
  this.tex = new Array()
  this.addTexture = function (Name, Num, Texture, Type) {
    var TempTex = {}
    TempTex.num = Num
    TempTex.name = Name
    TempTex.texture = Texture
    TempTex.type = Type
    this.tex.push(TempTex)
  }
  this.activeTextures = function () {
    for (var Texture of this.tex) {
      shaderProgram[Texture.name] = gl.getUniformLocation(shaderProgram, 'Tex2D')
      gl.activeTexture(gl['TEXTURE' + Texture.num])
      gl.bindTexture(gl[Texture.type], Texture.texture)
      gl.uniform1i(shaderProgram[Texture.name], 0)
    }
  }
  this.addParam = function (Name, Type) {
    const Index = this.param.indexOf(Name)

    if (Index == -1) {
      var TempParam = {}
      TempParam.name = Name
      TempParam.type = Type
      this.param.push(TempParam)
    }
  }
  this.findParam = function (Name) {
    for (var Param of this.param) {
      if (Param.name == Name) {
        return this.param.indexOf(Param)
      }
    }
    return -1
  }
  this.setUniform = function (Name, Value) {
    const Index = this.findParam(Name)
    const Param = this.param[Index]
    if (Index != -1) {
      shaderProgram[Param.name] = gl.getUniformLocation(shaderProgram, Param.name)
      if (Param.type == 'Matrix4fv') {
        gl['uniform' + Param.type](shaderProgram[Name], false, Value)
      } else {
        gl['uniform' + Param.type](shaderProgram[Name], Value)
      }
    }
  }
}

var storage = new Store()

var Params = function () {
  this.param1 = 50.0
  this.param2 = 60.0
  this.param3 = 0.0
  this.param4 = 0.0
}

function getShader (gl, type, str) {
  var shader
  shader = gl.createShader(type)

  gl.shaderSource(shader, str)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader))
    return null
  }

  return shader
}

var shaderProgram

function initShaders () {
  var fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fsShaderStr)
  var vertexShader = getShader(gl, gl.VERTEX_SHADER, vxShaderStr)

  shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialize shaders')
  }

  gl.useProgram(shaderProgram)

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
}

var mvMatrix = mat4.create()
var pMatrix = mat4.create()
var offX = 0.0
var offY = 0.0
var zoom = 1.0
var timeMs = Date.now()
var startTime = Date.now()
var Tex2D
var param1 = 50.0
var param2 = 60.0
var param3 = 0.0
var param4 = 0.0

function setUniforms () {
  storage.setUniform('uPMatrix', pMatrix)
  storage.setUniform('uMVMatrix', mvMatrix)
  storage.setUniform('uTime', timeMs)
  storage.setUniform('offX', offX)
  storage.setUniform('offY', offY)
  storage.setUniform('zoom', zoom)
  storage.setUniform('param1', param1)
  storage.setUniform('param2', param2)
  storage.setUniform('param3', param3)
  storage.setUniform('param4', param4)

  storage.activeTextures()
}

var squareVertexPositionBuffer

function initBuffers () {
  squareVertexPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
  var vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  squareVertexPositionBuffer.itemSize = 3
  squareVertexPositionBuffer.numItems = 4
}

function drawScene () {
  timeMs = (Date.now() - startTime) / 1000
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix)

  mat4.identity(mvMatrix)

  mat4.translate(mvMatrix, [-3.0, 0.0, -2.0])

  mat4.translate(mvMatrix, [3.0, 0.0, 0.0])
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
  setUniforms()
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems)
}

function loadTexture (url) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  const pixel = new Uint8Array([0, 0, 255, 255])
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel)

  const image = new Image()
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D)
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
  }
  image.src = url

  return texture
}

function isPowerOf2 (value) {
  return (value & (value - 1)) === 0
}

function tick () {
  window.requestAnimationFrame(tick)
  drawScene()
  // console.log('tick' + new Date());
}

function GuiInit () {
  var menu = new Params()
  var gui = new dat.GUI()

  var contrParam1 = gui.add(menu, 'param1')
  var contrParam2 = gui.add(menu, 'param2')
  var contrParam3 = gui.add(menu, 'param3')
  var contrParam4 = gui.add(menu, 'param4')
  contrParam1.onChange(function (value) {
    param1 = value
  })
  contrParam2.onChange(function (value) {
    param2 = value
  })
  contrParam3.onChange(function (value) {
    param3 = value
  })
  contrParam4.onChange(function (value) {
    param4 = value
  })
}

function StorageInit () {
  Tex2D = loadTexture('tex.jpg')
  storage.addTexture('Tex2D', 0, Tex2D, 'TEXTURE_2D')

  storage.addParam('uPMatrix', 'Matrix4fv')
  storage.addParam('uMVMatrix', 'Matrix4fv')
  storage.addParam('uTime', '1f')
  storage.addParam('offX', '1f')
  storage.addParam('offY', '1f')
  storage.addParam('zoom', '1f')
  storage.addParam('param1', '1f')
  storage.addParam('param2', '1f')
  storage.addParam('param3', '1f')
  storage.addParam('param4', '1f')
}

function webGLStart () {
  var canvas = document.getElementById('webglCanvas')
  canvas.addEventListener('mousemove', control)
  canvas.addEventListener('mousedown', mouseDown)
  canvas.addEventListener('mouseup', mouseUp)
  canvas.addEventListener('mouseout', mouseUp)
  canvas.addEventListener('wheel', mouseWheel)

  GuiInit()

  initGL(canvas)

  StorageInit()

  initShaders()
  initBuffers()

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  tick()
}

var xNew, xOld, yNew, yOld
var IsClicked = false

function mouseDown () {
  IsClicked = true
}

function mouseUp () {
  IsClicked = false
  xNew = undefined
  yNew = undefined
}

function mouseWheel (e) {
  var oldZoom = zoom
  zoom += e.wheelDelta / 240.0
  offX += (zoom - oldZoom) * param1 / 100
  offY += (zoom - oldZoom) * param2 / 100
}

function control (e) {
  if (IsClicked) {
    xOld = xNew
    xNew = e.clientX
    yOld = yNew
    yNew = e.clientY
    if (xOld !== undefined) {
      offX += (xNew - xOld) / 200.0
    }
    if (yOld !== undefined) {
      offY += (yOld - yNew) / 200.0
    }
  }
}

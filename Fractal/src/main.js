import vxShaderStr from './main.vert';
import fsShaderStr from './main.frag';
import Image2D from './tex.jpg';
import * as dat from 'dat.gui';

import gitHash from '../hash.txt';

var gl;

function initGL (canvas) {
  try {
    gl = canvas.getContext('webgl2');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {}
  if (!gl) {
    alert('Could not initialize WebGL');
  }
}

var Store = function () {
  this.param = [];
  this.tex = [];
  this.addTexture = function (Name, Num, Texture, Type) {
    var TempTex = {};
    TempTex.num = Num;
    TempTex.name = Name;
    TempTex.texture = Texture;
    TempTex.type = Type;
    this.tex.push(TempTex);
  };
  this.activeTextures = function () {
    for (var Texture of this.tex) {
      shaderProgram[Texture.name] = gl.getUniformLocation(shaderProgram, 'Tex2D');
      gl.activeTexture(gl['TEXTURE' + Texture.num]);
      gl.bindTexture(gl[Texture.type], Texture.texture);
      gl.uniform1i(shaderProgram[Texture.name], 0);
    }
  };
  this.addParam = function (Name, Type) {
    const Index = this.param.indexOf(Name);

    if (Index == -1) {
      var TempParam = {};
      TempParam.name = Name;
      TempParam.type = Type;
      this.param.push(TempParam);
    }
  };
  this.findParam = function (Name) {
    for (var Param of this.param) {
      if (Param.name == Name) {
        return this.param.indexOf(Param);
      }
    }
    return -1;
  };
  this.setUniform = function (Name, Value) {
    const Index = this.findParam(Name);
    const Param = this.param[Index];
    if (Index != -1) {
      shaderProgram[Param.name] = gl.getUniformLocation(shaderProgram, Param.name);
      if (Param.type == 'Matrix4fv') {
        gl['uniform' + Param.type](shaderProgram[Name], false, Value);
      } else {
        gl['uniform' + Param.type](shaderProgram[Name], Value);
      }
    }
  };
};

var storage = new Store();

var Params = function () {
  this.param1 = 50.0;
  this.param2 = 60.0;
  this.param3 = 0.0;
  this.param4 = 0.0;
};

function getShader (gl, type, str) {
  var shader;
  shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

var shaderProgram;

function initShaders () {
  var fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fsShaderStr);
  var vertexShader = getShader(gl, gl.VERTEX_SHADER, vxShaderStr);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialize shaders');
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

var offLeft = 0.0;
var offRight = 1.0;
var offDown = 0.0;
var offUp = 1.0;
var timeMs = Date.now();
var startTime = Date.now();
var Tex2D;
var param1 = 50.0;
var param2 = 60.0;
var param3 = 0.0;
var param4 = 0.0;

function setUniforms () {
  storage.setUniform('uTime', timeMs);
  storage.setUniform('offRight', offRight);
  storage.setUniform('offLeft', offLeft);
  storage.setUniform('offUp', offUp);
  storage.setUniform('offDown', offDown);
  storage.setUniform('param1', param1);
  storage.setUniform('param2', param2);
  storage.setUniform('param3', param3);
  storage.setUniform('param4', param4);

  storage.activeTextures();
}

var squareVertexPositionBuffer;

function initBuffers () {
  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  var vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;
}

function drawScene () {
  timeMs = (Date.now() - startTime) / 1000;
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function loadTexture () {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const pixel = new Uint8Array([0, 0, 255, 255]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = Image2D;

  return texture;
}

function isPowerOf2 (value) {
  return (value & (value - 1)) === 0;
}

function tick () {
  window.requestAnimationFrame(tick);
  drawScene();
}

function GuiInit () {
  var menu = new Params();
  var gui = new dat.GUI();

  var contrParam1 = gui.add(menu, 'param1');
  var contrParam2 = gui.add(menu, 'param2');
  var contrParam3 = gui.add(menu, 'param3');
  var contrParam4 = gui.add(menu, 'param4');
  contrParam1.onChange(function (value) {
    param1 = value;
  });
  contrParam2.onChange(function (value) {
    param2 = value;
  });
  contrParam3.onChange(function (value) {
    param3 = value;
  });
  contrParam4.onChange(function (value) {
    param4 = value;
  });
}

function StorageInit () {
  Tex2D = loadTexture();
  storage.addTexture('Tex2D', 0, Tex2D, 'TEXTURE_2D');

  storage.addParam('uTime', '1f');
  storage.addParam('offRight', '1f');
  storage.addParam('offLeft', '1f');
  storage.addParam('offUp', '1f');
  storage.addParam('offDown', '1f');
  storage.addParam('zoom', '1f');
  storage.addParam('param1', '1f');
  storage.addParam('param2', '1f');
  storage.addParam('param3', '1f');
  storage.addParam('param4', '1f');
}

var canvas = document.getElementById('webglCanvas');

function webGLStart () {
  canvas.addEventListener('mousemove', control);
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('mouseout', mouseUp);
  canvas.addEventListener('wheel', mouseWheel);

  document.getElementById('git-hash').innerHTML += '<a href="https://github.com/Kerblif/JS-learning/tree/master/Fractal">Git</a> hash: ' + gitHash;

  GuiInit();

  initGL(canvas);

  StorageInit();

  initShaders();
  initBuffers();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  tick();
}

var xNew, xOld, yNew, yOld;
var IsClicked = false;

function mouseDown () {
  IsClicked = true;
}

function mouseUp () {
  IsClicked = false;
  xNew = undefined;
  yNew = undefined;
}

function getMousePos () {
  var rect = canvas.getBoundingClientRect();
  return {
    x: xNew - rect.left,
    y: yNew - rect.top
  };
}

function mouseWheel (e) {
  var MousePos = getMousePos();
  MousePos.y = 500 - MousePos.y;

  var scroll = e.deltaY / 10.0;
  var newZoom = 1;

  if (scroll > 0) {
    newZoom *= 1 + 0.5 * scroll / 100.0;
  } else {
    newZoom /= 1 - 0.5 * scroll / 100.0;
  }

  var newLeft = offLeft + MousePos.x / 500.0 * (offRight - offLeft) * (1 - newZoom);
  var newDown = offDown + MousePos.y / 500.0 * (offUp - offDown) * (1 - newZoom);
  offRight = newLeft + (offRight - offLeft) * newZoom;
  offUp = newDown + (offUp - offDown) * newZoom;

  offLeft = newLeft;
  offDown = newDown;
}

function control (e) {
  xOld = xNew;
  xNew = e.clientX;
  yOld = yNew;
  yNew = e.clientY;
  if (IsClicked) {
    if (xOld !== undefined) {
      var newLeft = offLeft - (xNew - xOld) / 500.0 * (offRight - offLeft);
      offRight = newLeft + (offRight - offLeft);
      offLeft = newLeft;
    }
    if (yOld !== undefined) {
      var newDown = offDown + (yNew - yOld) / 500.0 * (offUp - offDown);
      offUp = newDown + (offUp - offDown);
      offDown = newDown;
    }
  }
}

document.addEventListener('DOMContentLoaded', webGLStart)
;

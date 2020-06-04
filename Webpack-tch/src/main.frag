#version 300 es
precision highp float;

uniform float uCellWidth;
uniform float uTime;

out vec4 oColor;

void main(void)
{
    bool rowType = mod(gl_FragCoord.y / uCellWidth, 2.0) > 1.0;
    bool columnType = mod(gl_FragCoord.x / uCellWidth, 2.0) > 1.0;

    bool cellType = rowType ^^ columnType;

    if (cellType)
      oColor = vec4(vec3(1, 0.5, 0) * abs(sin(uTime * 5.0)), 1.0);
    else
      oColor = vec4(vec3(1, 1, 1), 1.0);
}
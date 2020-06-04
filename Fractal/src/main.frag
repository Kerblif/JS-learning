#version 300 es
precision highp float;

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
}
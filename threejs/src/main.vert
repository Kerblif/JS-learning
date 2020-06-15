uniform sampler2D bumpTexture;

varying float height;
varying vec2 pos;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    height = position.y / 73.4;
    pos = position.xz;
}
uniform sampler2D dustTexture;
uniform float alpha;

varying vec2 pos;

void main()
{
    vec4 color = texture2D(dustTexture, pos);
    color.a = color.r * alpha;
    gl_FragColor = color;
}
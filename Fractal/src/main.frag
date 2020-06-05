#version 300 es
precision highp float;

uniform float offRight, offLeft, offUp, offDown;
uniform float uTime;
uniform sampler2D Tex2D;

uniform float param3, param4;

out vec4 oColor;

float Mandl( vec2 C, vec2 Z )
{
    vec2 C0 = C;
    float n = 0.0;
    float moduleC = 0.0;
    for(float j = 0.0; j < 255.0; j++)
    {
        C0 = vec2(C0.x * C0.x - C0.y * C0.y, C0.y * C0.x + C0.x * C0.y) + Z;
        moduleC = C0.x * C0.x + C0.y * C0.y;
        if (moduleC >= 16.0)
        {
            n = j;
            break;    
        } 
    }
    return n;
}
void main(void)
{
    float n;
    vec2 C = vec2(0.35, 0.38);
    vec2 Z;
    vec2 xy = vec2(offLeft, offDown) + gl_FragCoord.xy / 500.0 * (vec2(offRight, offUp) - vec2(offLeft, offDown));
    //vec2 xy = vec2(0.0, 0.0);
    C.x = 0.5 + 0.711 * sin(uTime / 8.2);
    C.y = 1.05 + 3.711 * sin(uTime / 8.2);
    Z.x = xy.x;
    Z.y = xy.y;
    n = Mandl(Z, C);
    vec3 TexColor = texture(Tex2D, xy).xyz;  
    oColor.x = n * TexColor.x;
    oColor.y = n * TexColor.y;
    oColor.z = n * TexColor.z;  
    oColor.w = 1.0;    
}
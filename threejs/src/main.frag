uniform sampler2D oceanTexture;
uniform sampler2D sandyTexture;
uniform sampler2D grassTexture;
uniform sampler2D rockyTexture;
uniform sampler2D snowyTexture;

varying float height;
varying vec2 pos;

void main()
{
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    if (height > 0.80) {
        float Coef = abs(1.0 - height) * (-10.0) + 2.0;
        if (Coef > 1.0) {
            Coef = 1.0;
        }
        gl_FragColor += Coef * texture2D(snowyTexture, pos);
    }
    if (height < 0.85 && height > 0.70) {
        float Coef = abs(height - 0.775) * (-20.0) + 1.5;
        if (Coef > 1.0) {
            Coef = 1.0;
        }
        gl_FragColor += Coef * texture2D(rockyTexture, pos);
    }
    if (height < 0.75 && height > 0.35) {
        float Coef = abs(height - 0.55) * (-20.0) + 4.0;
        if (Coef > 1.0) {
            Coef = 1.0;
        }
        gl_FragColor += Coef * texture2D(grassTexture, pos);
    }
    if (height < 0.40 && height > 0.30) {
        float Coef = abs(height - 0.35) * (-20.0) + 1.0;
        if (Coef > 1.0) {
            Coef = 1.0;
        }
        gl_FragColor += Coef * texture2D(sandyTexture, pos);
    }
    if (height < 0.35) {
        float Coef = abs(height - 0.35) * 20.0;
        if (Coef > 1.0) {
            Coef = 1.0;
        }
        gl_FragColor += Coef * texture2D(oceanTexture, pos);
    }
}
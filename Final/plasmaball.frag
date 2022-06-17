#version 330 compatibility

uniform float uAd;
uniform float uBd;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uAlpha;
uniform float uTol;
uniform sampler2D Noise2;
uniform bool uUseChromaDepth;
uniform float uChromaRed;
uniform float uChromaBlue;
uniform float Timer;

//PER-FRAGMENT LIGHTING//////////////
uniform float uKa, uKd, uKs;
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uShininess;
uniform bool uFlat;
flat in vec3 vNf;
in vec3 vNs;
flat in vec3 vLf;
in vec3 vLs;
flat in vec3 vEf;
in vec3 vEs;
///////////////////////////////////

in vec3  vMCposition;
in vec3	 vECposition;
in float vLightIntensity;
in  vec2  vST;		// texture coords


const vec3 WHITE = vec3( 1., 1., 1.);


void
main()
{
    //PER-FRAGMENT LIGHTING
    vec3 Normal;
    vec3 Light;
    vec3 Eye;

    if( uFlat )
    {
        Normal = normalize(vNf);
        Light = normalize(vLf);
        Eye = normalize(vEf);
    }
    else
    {
        Normal = normalize(vNs);
        Light = normalize(vLs);
        Eye = normalize(vEs);
    }

    vec4 myColor = vec4(1.);
    vec4 ambient = uKa * myColor;
    float d = max( dot(Normal,Light), 0. );
    vec4 diffuse = uKd * d * myColor;
    float s = 0.;
    if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
        s = pow( max( dot(Eye,ref),0. ), uShininess );
    }
    vec4 specular = uKs * s * uSpecularColor;

    //gl_FragColor = vec4(WHITE * vLightIntensity, uAlpha);
    //0.1017 is good alpha val for sphere
   gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, .1017);

}
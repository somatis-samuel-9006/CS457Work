#version 330 compatibility

uniform float uA;
uniform float uP;
uniform float uTol;
uniform sampler2D Noise2;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float Timer;

in float vX, vY, vZ;
in vec3 vColor;
in float vLightIntensity;
in vec3 vECposition;
in  vec2  vST;		// texture coords

flat in vec3 vNf;
in vec3 vNs;
flat in vec3 vLf;
in vec3 vLs;
flat in vec3 vEf;
in vec3 vEs;

uniform float uKa, uKd, uKs;
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uShininess;
//uniform bool uFlat;

const vec3 WHITE = vec3( 1., 1., 1. );

void
main( )
{

    //noise function 
    vec4 nv  = texture2D( Noise2, uNoiseFreq*vST );
	//give the noise a range of [-1.,+1.]:
	float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
	n = (n - 2.);                           // -1. -> 1.
	n *= uNoiseAmp;

    float f;
    if(vZ >= -7. &&  vZ <= -3.){
        f = fract( uA*vZ );
    }
    else if(vZ > -3. && vZ <= 3.){
        f = fract( uA*vX);
    }

    else{
        f = fract( uA*vY);
    }


    float t = smoothstep( 1.5-uP-uTol, 0.5-uP+uTol, f ) - smoothstep( 0.5+uP-uTol, 0.5+uP+uTol,
                                                 ((f + uNoiseAmp) * uNoiseFreq)  );

    //per fragement lighting stuff
    vec3 Normal;
    vec3 Light;
    vec3 Eye;

    Normal = normalize(vNs);
    Light = normalize(vLs);
    Eye = normalize(vEs);

    vec3 rgb = vLightIntensity * mix( WHITE, vColor, t );
    vec4 ambient = uKa * vec4(rgb, 1);
    float d = max( dot(Normal,Light), 0. );
    vec4 diffuse = uKd * d * vec4(rgb, 1);
    float s = 0.;
    if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
        s = pow( max( dot(Eye,ref),0. ), uShininess );
    }
    vec4 specular = uKs * s * uSpecularColor;

    gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );
    //gl_FragColor = vec4( rgb, 1. );
}
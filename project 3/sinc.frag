#version 330 compatibility

uniform float uKa, uKd, uKs, uNoiseAmp, uNoiseFreq;
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uShininess;
uniform bool uFlat;
uniform sampler3D Noise3;

flat in vec3 vNf;
in vec3 vNs;
flat in vec3 vLf;
in vec3 vLs;
flat in vec3 vEf;
in vec3 vEs;
in vec3 vMC;

//utility function for rotating normal
vec3
RotateNormal( float angx, float angy, vec3 n )
{
        float cx = cos( angx );
        float sx = sin( angx );
        float cy = cos( angy );
        float sy = sin( angy );

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;
        // n.x      =  n.x;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;
        // n.y      =  n.y;

        return normalize( n );
}

void main( )
{
    //from project 3 sample code, perturb (rotate) the Normal
    vec4 nvx = texture( Noise3, uNoiseFreq*vMC );
    float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;	// -1. to +1.
    angx *= uNoiseAmp;

    vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );
    float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;	// -1. to +1.
    angy *= uNoiseAmp;

    //start per fragment lighting
    vec3 Normal;
    vec3 Light;
    vec3 Eye;

    if( uFlat )
    {
        //now our normal that we have from vertex shader is initialized, so we now rotate it and * the return value by gl_NormalMatrix?
        vec3 rotatedNormal = RotateNormal(angx, angy, vNf);
        Normal = normalize(gl_NormalMatrix * rotatedNormal);
        Light = normalize(vLf);
        Eye = normalize(vEf);
    }
    else
    {
        vec3 rotatedNormal = RotateNormal(angx, angy, vNs);
        Normal = normalize(gl_NormalMatrix * rotatedNormal);
        Light = normalize(vLs);
        Eye = normalize(vEs);
    }

    vec4 ambient = uKa * uColor;
    float d = max( dot(Normal,Light), 0. );
    vec4 diffuse = uKd * d * uColor;

    float s = 0.;
    if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
        s = pow( max( dot(Eye,ref),0. ), uShininess );
    }
    vec4 specular = uKs * s * uSpecularColor;
    //end per fragment lighting
    gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );

}
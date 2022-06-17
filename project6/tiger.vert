#version 330 compatibility

uniform float Timer;

uniform float uLightX, uLightY, uLightZ;
vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );

out vec3 vColor;
out float vX, vY, vZ;
out float vLightIntensity;
out vec3 vECposition;
out  vec2  vST;		// texture coords

//per fragement lighting values
flat out vec3 vNf;
out vec3 vNs;
flat out vec3 vLf;
out vec3 vLs;
flat out vec3 vEf;
out vec3 vEs;

const vec3 LIGHTPOS = vec3( 0., 0., 10. );

void
main( )
{
    vec3 tnorm = normalize( gl_NormalMatrix * gl_Normal );
    vec3 ECpositionOld = ( gl_ModelViewMatrix * gl_Vertex ).xyz;
    
    vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;
    vNf = normalize( gl_NormalMatrix * gl_Normal ); // surface normal vector
    vLightIntensity = abs( dot( normalize(LIGHTPOS - ECpositionOld), tnorm ) );
    vNs = vNf;
    vLf = eyeLightPosition - ECposition.xyz; // vector from the point
    vLs = vLf; // to the light position
    vEf = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point
    vEs = vEf ; // to the eye position 

    vec4 pos = gl_Vertex;
    vColor = pos.xyz;
    vec3 MCposition = gl_Vertex.xyz;

    vX = MCposition.x;
    vY = MCposition.y;
    vZ = MCposition.z;
    //vECposition = vec3( gl_ModelViewMatrix * gl_Vertex );
    //this line is only here to make the lines bend (not be straight) by the values uAmp and uFreq
    //vX = (vX + sin(3.14 * vY) + 3.) + (2 * Timer);
    vX = (vX + sin(3.14 * vY) + (3*sin(vY))) + (5. * Timer);
    vY = (vY + 2.13 * cos(vX * 3.14)) + (.5 * Timer);
    vZ = (vZ + 1.2 * sin( 5. * vY )) + (2 * Timer);
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
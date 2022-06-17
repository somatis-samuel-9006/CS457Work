#version 330 compatibility

uniform float uLightX, uLightY, uLightZ;

flat out vec3 vNf;
out vec3 vNs;
flat out vec3 vLf;
out vec3 vLs;
flat out vec3 vEf;
out vec3 vEs;

out vec3  vMCposition;

out  vec2  vST;		// texture coords


vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );

void
main( )
{
	vST = gl_MultiTexCoord0.st;

	//DIFUSE LIGHTING
	//vec3 tnorm      = normalize( gl_NormalMatrix * gl_Normal );
	//vECposition = vec3( gl_ModelViewMatrix * gl_Vertex );
	//vLightIntensity  = abs( dot( normalize(LIGHTPOS - vECposition), tnorm ) );

	//PER-FRAGMENT LIGHTING

	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;
	vNf = normalize( gl_NormalMatrix * gl_Normal ); // surface normal vector
	vNs = vNf;
	vLf = eyeLightPosition - ECposition.xyz; // vector from the point
	vLs = vLf; 								 // to the light position
	vEf = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point
	vEs = vEf ; 							   // to the eye position 
	vMCposition  = gl_Vertex.xyz;
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
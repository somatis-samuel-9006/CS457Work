
#version 330 compatibility
uniform float uLightX, uLightY, uLightZ, uA, uK;

flat out vec3 vNf;
out vec3 vNs;
flat out vec3 vLf;
out vec3 vLs;
flat out vec3 vEf;
out vec3 vEs;
out vec3 vMC;

vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );

//sinc functions for displacement mapping
float
Sinc( float r, float k )
{
	if( r*k == 0. )
		return 1.;
	return sin(r*k) / (r*k);
}

float
DerivSinc( float r, float k )
{
	if( r*k == 0. )
		return 0;
	return ( r*k*cos(r*k) - sin(r*k) ) / ( r*k*r*k );
}
void
main( )
{
    //from project 3 sample code, displacing z
    vec4 newVertex = gl_Vertex;
    float r = sqrt( newVertex.x*newVertex.x + newVertex.y*newVertex.y );
    newVertex.z = uA * Sinc(r, uK);

    //computing the normal
    float dzdr = uA * DerivSinc( r, uK );
    float drdx = newVertex.x / r;
    float drdy = newVertex.y / r;
    float dzdx = dzdr * drdx;
    float dzdy = dzdr * drdy;

    vec3 Tx = vec3(1., 0., dzdx );
    vec3 Ty = vec3(0., 1., dzdy );
    vec3 newNormal = normalize( cross( Tx, Ty ) );
    //start per fragment lighting, change 'gl_Vertex' to newVertex and 'gl_Normal' to newNormal?

    vec4 ECposition = gl_ModelViewMatrix * newVertex;
    vNf = normalize( gl_NormalMatrix * newNormal ); // surface normal vector
    vNs = vNf;

    vLf = eyeLightPosition - ECposition.xyz; // vector from the point
    vLs = vLf;                                 // to the light position

    vEf = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point
    vEs = vEf ;                                 // to the eye position
    //end per fragment lighting
    vMC = newVertex.xyz;
    gl_Position = gl_ModelViewProjectionMatrix * newVertex;
}
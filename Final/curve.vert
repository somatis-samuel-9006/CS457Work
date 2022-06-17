#version 330 compatibility

out vec2 vST;
out vec3 vMC;
out vec4 vWC;

void
main()
{
    vST = gl_MultiTexCoord0.st;
    vMC = gl_Vertex.xyz;
    vWC = gl_ModelViewMatrix * gl_Vertex;
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
#version 330 compatibility

in vec3 gxyz;
in vec4 vWC;
uniform float uRed, uGreen, uBlue;
//might just have a slider to change the color of the plasma

void
main()
{
    float x = vWC.x;
    float y = vWC.y;
    float z = vWC.z;

    gl_FragColor = vec4(uRed, uGreen, uBlue, 0.5);

}
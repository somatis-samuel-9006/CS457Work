#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable
layout( lines_adjacency ) in;
layout( line_strip, max_vertices=128 ) out;
uniform int uAmp;
uniform float Timer;
uniform float uNoiseAmp, uNoiseFreq;
uniform sampler3D Noise3;
out vec3 gxyz;
//in vec2 vST[2];
in  vec3 vMC[4];

const float uNum = 150.;

void
main()
{
 

    float timer = .5*sin(2.*3.14*Timer) + .5;


    float dt = 1. / float(uNum);
    float t = 0.;
    for( int i = 0; i <= uNum; i++ )
    {
        float omt = 1. - t;
        float omt2 = omt * omt;
        float omt3 = omt * omt2;
        float t2 = t * t;
        float t3 = t * t2;
        vec4 xyzw = omt3 * gl_PositionIn[0].xyzw +
        3. * t * omt2 * gl_PositionIn[1].xyzw  +
        3. * t2 * omt * gl_PositionIn[2].xyzw +
        t3 * gl_PositionIn[3].xyzw;
           //noise function
        vec4 nv  = texture3D( Noise3, uNoiseFreq * xyzw.xyz);
	    //give the noise a range of [-1.,+1.]:
	    float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
	    n = (n - 2.);                           // -1. -> 1.
	    n *= uNoiseAmp;
        xyzw = omt3 * gl_PositionIn[0].xyzw +
        3. * t * omt2 * (gl_PositionIn[1].xyzw - (3.14 * (0.3 * uAmp))) +
        3. * t2 * omt * (gl_PositionIn[2].xyzw + (sin(timer * 10. * n) * uNoiseFreq) - (0.3 * uAmp)) +
        t3 * (gl_PositionIn[3].xyzw + (sin(timer * -10.) * uNoiseFreq) + (0.3 * uAmp));
        gl_Position = xyzw;

        gxyz = xyzw.xyz;
        EmitVertex( );
        t += dt;
        
    }
}
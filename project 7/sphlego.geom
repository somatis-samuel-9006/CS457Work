#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout( triangles )  in;
layout( triangle_strip, max_vertices=204 )  out;

uniform int uLevel;
uniform float uQuantize;
uniform bool uRadiusOnly;

in vec3 vNormal[3];
out float gLightIntensity;
const vec3 LIGHTPOS = vec3( 0., 10., 0. );

vec3 V0, V01, V02, N0, N01, N02;

float
Sign( float f )
{
        if( f >= 0. )   return  1.;
        return -1.;
}


float
Quantize( float f )
{
        f *= uQuantize;
        f += 0.5 * Sign(f);                // round-off
        int fi = int( f );
        f = float( fi ) / uQuantize;
        return f;
}

const float PI = 3.14159265;

float
atan2( float y, float x )
{
        if( x == 0. )
        {
                if( y >= 0. )
                        return  PI/2.;
                else
                        return -PI/2.;
        }
        return atan(y,x);
}

void
ProduceVertex( float s, float t )
{
    //create new (x, y, z) to form triangle strips
    vec3 v = V0 + s*V01 + t*V02;
    //v = normalize(v);
    //turn that (x, y, z) into (r, theta, phi)
    float r = length( v );
    float theta = atan2( v.z, v.x );
    float phi   = atan2( v.y, length( v.xz ) );

    //create new (nx, ny, nz)
    vec3 n = N0 + s*N01 + t*N02;
    //transform and normalize that (nx, ny, nz)
    vec3 tnorm = normalize( gl_NormalMatrix * n ); // the transformed normal
    //use that to produce gLightIntensity
    vec4 ECposition = gl_ModelViewMatrix * vec4(v, 1. );
    gLightIntensity = abs( dot( normalize(LIGHTPOS - ECposition.xyz), tnorm ) );

    if(uRadiusOnly){
        //quantize just the r
        r = Quantize(r);
    }
    else {
        r = Quantize(r);
        theta = Quantize(theta);
        phi = Quantize(phi);
    }
    //turn (r, theta, phi) back into (x, y, z)
    v.y = r * sin( phi );
    float xz = r * cos( phi );
    v.x = xz * cos( theta );
    v.z = xz * sin( theta );


    gl_Position = gl_ModelViewProjectionMatrix * vec4(v, 1.);
    EmitVertex( );
}    

void
main()
{
    //these are the corner points of the original triangle
    V01 = ( gl_PositionIn[1] - gl_PositionIn[0] ).xyz;
    V02 = ( gl_PositionIn[2] - gl_PositionIn[0] ).xyz;
    V0 = gl_PositionIn[0].xyz;

    // V01 = V1 - V0
    // V02 = V2 - V0

    //these are the corner normals of the original triangle
    N01 = vNormal[1] - vNormal[0];
    N02 = vNormal[2] - vNormal[0];
    N0 = vNormal[0];

    int numLayers = 1 << uLevel;

    float dt = 1. / float( numLayers );
    float t_top = 1.;

    for(int it = 0; it < numLayers; it++){
        //from noteset on sphere subdivision
        float t_bot = t_top - dt;
        float smax_top = 1. - t_top;
        float smax_bot = 1. - t_bot;

        int nums = it + 1;
        float ds_top = smax_top / float( nums - 1 );
        float ds_bot = smax_bot / float( nums );

        float s_top = 0.;
        float s_bot = 0.;

        for(int is = 0; is < nums; is++){
            ProduceVertex(s_bot, t_bot);
            ProduceVertex(s_top, t_top);
            s_top += ds_top;;
            s_bot += ds_bot;
        }
        ProduceVertex(s_bot, t_bot);
        EndPrimitive();

        t_top = t_bot;
        t_bot -= dt;
    }
}
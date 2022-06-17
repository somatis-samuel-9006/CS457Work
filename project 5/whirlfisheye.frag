#version 330 compatibility

#define PI  3.14159265358979323846
uniform float uPower;
uniform float uRtheta;
uniform float uBlend;
uniform float uContrast;
uniform sampler2D TexUnitA;
uniform sampler2D TexUnitB;

in vec2 vST;

const vec4 BLACK = vec4( 0., 0., 0., 1. );
const vec4 WHITE = vec4(1., 1., 1., 1.);

//arctangent function
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
main()
{
    //fish eye calculation
    vec2 st = vST - vec2(0.5, 0.5);  // put (0,0) in the middle so that the range is -0.5 to +0.5
    float r = length(st);
    float rPrime = pow((2 * r), uPower);

    //whirl calculation
    float theta = atan2(st.t, st.s);
    float thetaPrime = theta - uRtheta * r;

    //restoring s and t
    st = rPrime * vec2( cos(thetaPrime), sin(thetaPrime) );  		// now in the range -1. to +1.
    st += vec2(1., 1.);                        		    // change the range to 0. to +2.
    st *= vec2(0.5, 0.5); 		       			        // change the range to 0. to +1.

    //finishing up
    // if s or t wander outside the range [0.,1.], paint the pixel black
    if( any( lessThan(st, vec2(0., 0.)) ) )
        gl_FragColor = BLACK;
    else
        if( any( greaterThan(st, vec2(1., 1.)) ) )
            gl_FragColor = WHITE;
        else
        {
            //sample both textures at (s,t)
            vec3 t1 = texture2D(TexUnitA, st).rgb;
            vec3 t2 = texture2D(TexUnitB, st).rgb;
            //mix the two samples using uBlend
            vec3 rgb = mix(t1, t2, uBlend);
            //do the contrasting according to our Image notes
            vec3 idontwant = vec3(0.5, 0.5, 0.5);
            rgb = mix(idontwant, rgb, uContrast);
            gl_FragColor = vec4( rgb, 1. );
        }
}
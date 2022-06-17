#version 330 compatibility

uniform float uAd;
uniform float uBd;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uAlpha;
uniform float uTol;
uniform sampler2D Noise2;
uniform bool uUseChromaDepth;
uniform float uChromaRed;
uniform float uChromaBlue;

in vec3  vMCposition;
in vec3	 vECposition;
in float vLightIntensity;
in  vec2  vST;		// texture coords
//in vec4 vColor;


const vec3 WHITE = vec3( 1., 1., 1.);

vec3
Rainbow( float d )
{
	d = clamp( d, 0., 1. );

	float r = 1.;
	float g = 0.0;
	float b = 1.  -  6. * ( d - (5./6.) );

        if( d <= (5./6.) )
        {
                r = 6. * ( d - (4./6.) );
                g = 0.;
                b = 1.;
        }

        if( d <= (4./6.) )
        {
                r = 0.;
                g = 1.  -  6. * ( d - (3./6.) );
                b = 1.;
        }

        if( d <= (3./6.) )
        {
                r = 0.;
                g = 1.;
                b = 6. * ( d - (2./6.) );
        }

        if( d <= (2./6.) )
        {
                r = 1.  -  6. * ( d - (1./6.) );
                g = 1.;
                b = 0.;
        }

        if( d <= (1./6.) )
        {
                r = 1.;
                g = 6. * d;
        }

	return vec3( r, g, b );
}

void
main()
{
	vec4 nv  = texture2D( Noise2, uNoiseFreq*vST );
	//give the noise a range of [-1.,+1.]:
	float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
	n = (n - 2.);                           // -1. -> 1.
	n *= uNoiseAmp;

	//values for generating eliptical dots
	float Ar = uAd / 2.;
	float Br = uBd / 2.;
	float s = vST.s;
	float t = vST.t;
	int numins = int(s / uAd);
	int numint = int(t / uBd);
	float sc = numins * uAd + Ar;
	float ds = s - sc;
	float tc = numint * uBd + Br;
	float dt = t - tc;

	float oldDist = sqrt( ds*ds + dt*dt );
	float newDist = oldDist + n;
	float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.

	//scale ds then divide by Ar
	ds *= scale;
	ds /= Ar;

	//scale dt then divide by Br
	dt *= scale;
	dt /= Br;

	//new elipse equation
	float d = ds*ds + dt*dt;

	float tt = smoothstep( 1. - uTol, 1. + uTol, d );


	vec4 dotColor = vec4(WHITE * vLightIntensity, 1.);
	vec4 notDotColor = vec4(vec3(1., 0., 0.) * vLightIntensity, uAlpha);

	//do chromadepth stuff
	if( uUseChromaDepth )
	{
		float t = (2./3.) * ( vECposition.z - uChromaRed ) / ( uChromaBlue - uChromaRed );
		t = clamp( t, 0., 2./3. );
		dotColor = vec4(Rainbow( t ), 1.);
	}
	vec4 rgb = mix(dotColor, notDotColor, tt);
	if(uAlpha == 0.){
		if(rgb == notDotColor){
			discard;
		}
	}
	gl_FragColor = rgb;




	//vec4 rgb = vLightIntensity * mix( WHITE, vColor, tt );
	//border of ellipse equation
	//float ellipse_border = (   ((s-sc) * (s-sc)) / (Ar * Ar)   ) + (    ((t-tc) * (t-tc)) / (Br * Br)  );

}
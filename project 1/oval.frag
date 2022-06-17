#version 330 compatibility

uniform float uAd;
uniform float uBd;
uniform float uTol;

in vec3  vMCposition;
in float vLightIntensity;
in  vec2  vST;		// texture coords
in vec3 vColor;


const vec3 WHITE = vec3( 1., 1., 1. );

void
main()
{
	float Ar = uAd / 2.;
	float Br = uBd / 2.;
	float s = vST.s;
	float t = vST.t;
	int numins = int(s / uAd);
	int numint = int(t / uBd);
	float sc = numins * uAd + Ar;
	float tc = numint * uBd + Br;

	//border of ellipse equation
	float ellipse_border = (   ((s-sc) * (s-sc)) / (Ar * Ar)   ) + (    ((t-tc) * (t-tc)) / (Br * Br)  );

	float tt = smoothstep( 1. - uTol, 1. + uTol, ellipse_border );

	//T out = mix( T value0, T value1, float tt )

	vec3 rgb = vLightIntensity * mix( WHITE, vColor, tt );
	gl_FragColor = vec4( rgb, 1. );





}
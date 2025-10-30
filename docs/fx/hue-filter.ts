(() => {
  if (typeof (window as any).PIXI === 'undefined' && typeof (PIXI as any) === 'undefined') return;

  // Vertex shader (standard)
  const vertexShader = `
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat3 projectionMatrix;
    varying vec2 vTextureCoord;

    void main(void) {
      gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader with hue rotation
  const fragmentShader = `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uHue;
    uniform float uSaturation;
    uniform float uIntensity;

    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main(void) {
      vec4 color = texture2D(uSampler, vTextureCoord);
      
      if (color.a > 0.0) {
        vec3 hsv = rgb2hsv(color.rgb);
        
        // Apply hue rotation
        hsv.x = mod(hsv.x + uHue, 1.0);
        
        // Apply saturation multiplier
        hsv.y = clamp(hsv.y * uSaturation, 0.0, 1.0);
        
        vec3 rgb = hsv2rgb(hsv);
        
        // Mix with original based on intensity
        color.rgb = mix(color.rgb, rgb, uIntensity);
      }
      
      gl_FragColor = color;
    }
  `;

  const P: any = (window as any).PIXI || (PIXI as any);

  class HueRotationFilter extends P.Filter {
    constructor(hue: number = 0, saturation: number = 1.0, intensity: number = 1.0) {
      super(vertexShader, fragmentShader);
      this.hue = hue;
      this.saturation = saturation;
      this.intensity = intensity;
    }
    get hue() { return (this as any).uniforms.uHue; }
    set hue(value: number) { (this as any).uniforms.uHue = (((value % 360) + 360) % 360) / 360; }
    get saturation() { return (this as any).uniforms.uSaturation; }
    set saturation(value: number) { (this as any).uniforms.uSaturation = Math.max(0, value); }
    get intensity() { return (this as any).uniforms.uIntensity; }
    set intensity(value: number) { (this as any).uniforms.uIntensity = Math.max(0, Math.min(1, value)); }
  }

  if (typeof window !== 'undefined') {
    (window as any).ErrlHueFilter = HueRotationFilter;
  }
  if ((P as any).filters) {
    (P as any).filters.HueRotationFilter = HueRotationFilter;
  }
})();

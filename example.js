const torus = require('primitive-torus')()
const sphere = require('primitive-sphere')()
const numPoints = 2000
const volumePoints = require('./index')(torus.positions, torus.cells, numPoints)
const mat4 = require('pex-math/Mat4')
const regl = require('regl')({
  pixelRatio: 1,
  extensions: ['angle_instanced_arrays']
})

const camera = require('regl-camera')(regl, {
  center: [0, 0, 0],
  theta: Math.PI / 2,
  distance: 4
})

const drawTorus = regl({
  vert: `
  precision mediump float;
  attribute vec3 position;
  uniform mat4 projection, view;
  void main() {
    vec4 pos = vec4(position, 1);
    gl_Position = projection * view * pos;
  }`,
  frag: `
  precision mediump float;
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }`,
  attributes: {
    position: torus.positions
  },
  primitive: 'lines',
  elements: torus.cells,
  uniforms: {
    color: regl.prop('color')
  }
})

const drawSphere = regl({
  vert: `
  precision mediump float;
  attribute vec3 position, offset;
  uniform mat4 projection, view;
  void main() {
    vec4 pos = vec4(position, 1);
    pos.xyz *= vec3(0.005, 0.005, 0.005);
    pos.xyz += offset;
    gl_Position = projection * view * pos;
  }`,
  frag: `
  precision mediump float;
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }`,
  attributes: {
    position: sphere.positions,
    offset: {
      buffer: regl.buffer(volumePoints),
      divisor: 1
    }
  },
  elements: sphere.cells,
  instances: volumePoints.length,
  uniforms: {
    color: regl.prop('color')
  }
})

regl.frame(() => {
  regl.clear({
    color: [1, 1, 1, 1],
    depth: 1
  })
  camera(() => {
    drawTorus({
      color: [0.9, 0.9, 0.9],
      view: mat4.create()
    })
    drawSphere({
      color: [1, 0, 0],
      view: mat4.create()
    })
  })
})

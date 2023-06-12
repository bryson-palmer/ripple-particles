import { Suspense, useCallback, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import circleImg from './assets/circle.png'
// Turns jsx into html tag
extend({OrbitControls})

function CameraControls() {
  const { camera, gl: { domElement } } = useThree()

  const controlsRef = useRef()
  useFrame(() => controlsRef.current.update())

  return (
    <orbitControls
      // autoRotate
      ref={controlsRef}
      autoRotateSpeed={-0.2}
      args={[camera, domElement]}
    />
  )
}

function Points() {
  const imgTexture = useLoader(THREE.TextureLoader, circleImg)
  const bufferRef = useRef()
 
  // t = Phase shift, f = frequency, a = amplitude
  let t = 0
  let f = 0.002
  let a = 3
  // Ripple wave
  const graph = useCallback((x, z) => {
    return Math.sin(f * (x ** 2 + z ** 2 + t)) * a
  }, [a, f, t])

  const count = 100
  const separation = 3
  let positions = useMemo(() => {
    let positions = []

    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = separation * (xi - count / 2)
        let z = separation * (zi - count / 2)
        let y = graph(x, z)
        positions.push(x, y, z)
      }
    }

    return new Float32Array(positions)
  }, [graph])

  useFrame(() => {
    t += 10
    // a += 0.002

    const positions = bufferRef.current.array
    
    let i = 0
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = separation * (xi - count / 2)
        let z = separation * (zi - count / 2)

        positions[i + 1] = graph(x, z)
        i += 3
      }
    }

    bufferRef.current.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry attach='geometry'>
        <bufferAttribute
          ref={bufferRef}
          attach='attributes-position'
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        sizeAttenuation
        attach='material'
        map={imgTexture}
        color={0x00AAFF}
        size={0.5}
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  )
}

function AnimationCanvas() {
  return (
    <Canvas
      colormanagement='false'
      camera={{ position: [100, 20, -50], fov: 100 }}
    >
      <Suspense fallback={null}>
        <Points />
      </Suspense>
      <CameraControls />
    </Canvas>
  )
}

function App() {

  return (
    <div className='app'>
      <Suspense fallback={<div>Loading...</div>}>
        <AnimationCanvas />
      </Suspense>
    </div>
  )
}

export default App
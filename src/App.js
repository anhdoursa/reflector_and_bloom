import { Box, Loader, MeshReflectorMaterial, OrbitControls, Sphere, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import { DoubleSide, RepeatWrapping } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import './App.css';
import { EffectComposer, Bloom, Selection, Select } from '@react-three/postprocessing';

const Ground = () => {
  const { camera } = useThree((camera) => camera);
  useFrame((state, delta) => {
    console.log(camera);
  });
  const marbleTexture = useTexture('textures/marble/2.jpg');
  marbleTexture.repeat.set(4, 4);
  marbleTexture.wrapS = RepeatWrapping;
  marbleTexture.wrapT = RepeatWrapping;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry args={[10, 10]} />
      <MeshReflectorMaterial resolution={1024} map={marbleTexture} mirror={0.2} mixStrength={3} side={DoubleSide} />
    </mesh>
  );
};

const Triangle = ({ color, ...props }) => {
  const { paths: [path] } = useLoader(SVGLoader, 'textures/triangle.svg') // prettier-ignore
  const geom = useMemo(() => SVGLoader.pointsToStroke(path.subPaths[0].getPoints(), path.userData.style), []);
  const triangle = useRef();
  return (
    <mesh geometry={geom} {...props} ref={triangle} onClick={() => console.log(triangle.current)}>
      <meshBasicMaterial color={color} side={DoubleSide} />
    </mesh>
  );
};

function App() {
  const box = useRef();
  const sphere = useRef();
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Suspense fallback={<Loader />}>
        <Canvas camera={{ position: [-2.294827741789834, 5.369077115045752, 8.427648171586213] }}>
          {/* <axesHelper args={[100, 100, 100]} /> */}
          <OrbitControls maxPolarAngle={Math.PI / 2.1} />
          <ambientLight />
          <Selection>
            <EffectComposer>
              <Bloom luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} />
            </EffectComposer>
            <Select disable>
              <Ground />
            </Select>
            <Select>
              <Triangle color="cyan" position={[0, 1, -1]} scale={0.005} />
              <Box
                position={[-1, 1, 0]}
                ref={box}
                material-color="orange"
                onClick={() => console.log(box.current)}
              ></Box>
              <Sphere
                position={[1, 1, 2]}
                ref={sphere}
                material-color="#ff2060"
                args={[0.5]}
                onClick={() => console.log(sphere.current)}
              />
            </Select>
          </Selection>
        </Canvas>
      </Suspense>
    </div>
  );
}

export default App;

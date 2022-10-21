import { Environment, Html, Loader, MeshReflectorMaterial, OrbitControls, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { DoubleSide, EquirectangularReflectionMapping, RepeatWrapping } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import './App.css';
const Ground = () => {
  const marbleTexture = useTexture('textures/marble/1.jpg');
  marbleTexture.repeat.set(4, 4);
  marbleTexture.wrapS = RepeatWrapping;
  marbleTexture.wrapT = RepeatWrapping;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        resolution={1024}
        map={marbleTexture}
        mirror={0.2}
        mixStrength={3}
        side={DoubleSide}
        toneMapped={true}
      />
    </mesh>
  );
};
const Object = ({ children, color, name, position, text, ...props }) => {
  const mesh = useRef();
  const [bloom, setBloom] = useState(false);
  const [hover, setHover] = useState(false);
  // Change cursor on hover in Object
  useEffect(() => {
    if (hover) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [hover]);

  // Toogle Bloom effect
  const toggleBloom = () => {
    setBloom(!bloom);
  };

  useFrame(() => {
    mesh.current.rotation.y += 0.01;
  });
  return (
    <group>
      <mesh
        {...props}
        position={position}
        ref={mesh}
        onClick={toggleBloom}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        {children}
        <meshStandardMaterial color={color} toneMapped={bloom} side={DoubleSide} />
      </mesh>
      <Html position={[position[0], position[1] + 1.2, position[2]]} name={'html-' + name}>
        <div className="point">
          <div className="inner" onClick={toggleBloom}>
            <div className="inner-inner">
              <div className="circle" style={{ backgroundColor: color }}>
                <div className="content">
                  {text ? (
                    <p style={{ margin: '0 0 5px 0' }}>This mesh is create from a svg</p>
                  ) : (
                    <span>Click to on/off bloom effect</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

const Triangle = (props) => {
  const { paths: [path] } = useLoader(SVGLoader, 'textures/triangle.svg') // prettier-ignore
  const geom = useMemo(() => SVGLoader.pointsToStroke(path.subPaths[0].getPoints(), path.userData.style), []);

  return <Object {...props} geometry={geom} />;
};

function App() {
  const envTexture = useLoader(
    RGBELoader,
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr'
  );
  envTexture.mapping = EquirectangularReflectionMapping;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Suspense fallback={<Loader />}>
        <Canvas camera={{ position: [-2.294827741789834, 5.369077115045752, 8.427648171586213] }}>
          <Object color="yellow" name="box" position={[-3, 1, 0]}>
            <boxBufferGeometry />
          </Object>
          <Object color="pink" name="torus" position={[0, 1.3, 0]} scale={0.5} colorPick={true}>
            <torusKnotGeometry />
          </Object>
          <Triangle
            color="cyan"
            name="triangle"
            position={[3, 0.5, 0]}
            scale={0.005}
            text="This is a mesh convert from a svg"
          />
          <Ground />

          <EffectComposer>
            <Bloom luminanceThreshold={1} luminanceSmoothing={0.4} intensity={0.6} />
          </EffectComposer>

          <Environment map={envTexture} />
          <OrbitControls maxPolarAngle={Math.PI / 2.1} />
          <ambientLight />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default App;

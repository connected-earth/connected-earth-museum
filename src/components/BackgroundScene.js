// BackgroundScene.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

const BackgroundScene = () => {
  return (
    <Canvas className="three-canvas-container">
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} />
      <Sphere visible args={[1, 100, 200]} scale={2}>
        <MeshDistortMaterial color="#8352FD" distort={0.4} speed={2} />
      </Sphere>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default BackgroundScene;
import React from 'react';
import meteorScene from '../assets/3d/meteor.glb';
import { useGLTF } from '@react-three/drei';

const Meteor = () => {
    const { scene} = useGLTF(meteorScene);
  return (
    <mesh position={[5,2,1]} scale={[0.5, 0.5, 0.5]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Meteor
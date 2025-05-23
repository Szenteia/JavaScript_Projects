import React from 'react'
import PlaneScene from '../assets/3d/Plane.glb'
import { useGLTF } from '@react-three/drei'

const Plane = () => {
    const { scene, animations } = useGLTF(PlaneScene);
  return (
    <mesh position={[0,-1,1]} scale={[0.04,0.04,0.04]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Plane
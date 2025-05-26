import React from 'react'
import PlaneScene from '../assets/3d/Plane.glb'
import { useGLTF } from '@react-three/drei'

const Plane = ({ ...props}) => {
    const { scene} = useGLTF(PlaneScene);
  return (
    <mesh {...props}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Plane


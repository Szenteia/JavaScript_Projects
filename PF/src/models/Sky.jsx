import { useGLTF } from '@react-three/drei'
import React from 'react'

/* import skyScene from '../assets/3d/sky.glb' */
import skyScene2 from '../assets/3d/sky2.glb'

const Sky = () => {
    const sky = useGLTF(skyScene2);
  return (
    <mesh>
        <primitive object={sky.scene}/>
    </mesh>
  )
}

export default Sky
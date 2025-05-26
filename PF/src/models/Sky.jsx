import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/* import skyScene from '../assets/3d/sky.glb' */
import skyScene2 from '../assets/3d/sky2.glb'

const Sky = ({ isRotating }) => {
    const sky = useGLTF(skyScene2);
    const skyRef = useRef();

    useFrame((_, delta)=> {
      if(isRotating) {
        skyRef.current.rotation.y += 0.45 * delta
      }
    })
  return (
    <mesh ref={skyRef}>
        <primitive object={sky.scene}/>
    </mesh>
  )
}

export default Sky
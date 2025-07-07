import React, { useEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import PlaneScene from '../assets/3d/Plane-optimized.glb'

const Plane = ({isRotating, ...props}) => {
  const ref= useRef();
    const { scene, animations } = useGLTF(PlaneScene);
     const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    // Wait for actions to be properly initialized
    if (!actions || !actions['Take 001']) return

    const action = actions['Take 001']
    console.log({isRotating});
    if (isRotating) {
      action.play()
    } else {
      action.stop()
    }

    // Cleanup function
    return () => {
      action.stop()
    }
  }, [actions, isRotating])

  return (
    <mesh ref={ref} {...props}>
      <primitive object={scene} />
    </mesh>
  )
}

export default Plane
//"Luminaris Starship" (https://skfb.ly/QPX8) by iggy-design is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
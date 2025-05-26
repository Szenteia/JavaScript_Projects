import React, { useRef/* , useEffect  */} from 'react';
import meteorScene from '../assets/3d/meteor.glb';
import { useAnimations, useGLTF } from '@react-three/drei';

const Meteor = ({ /* isRotating, */ ...props }) => {
    const ref = useRef();
    const { scene/* , animations  */} = useGLTF(meteorScene);
/*     const { actions } = useAnimations(animations,scene);

     useEffect(()=> {

          if(isRotating){
            actions['Take 001'].play();
          } else {
            actions['Take 001'].stop();
          }
         }, [actions, isRotating]) */
  return (
    <mesh {...props} ref={ref} position={[5,2,1]} scale={[0.5, 0.5, 0.5]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Meteor
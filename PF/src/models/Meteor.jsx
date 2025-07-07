
import meteorScene from '../assets/3d/meteor-optimized.glb';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef} from 'react';

const Meteor = ({ isRotating, ...props }) => {
    const meteorRef = useRef();
    const { scene } = useGLTF(meteorScene);

useEffect(()=>
{
    if(isRotating) {
        meteorRef.current.visible = true;
    }
}, [isRotating])

useFrame((clock, camera, delta)=>{
    if(isRotating){meteorRef.current.rotation.y -= 0.1 * delta}
/*     if(meteorRef.current.position.x > camera.position.x + 10) {
        meteorRef.current.rotation.y = Math.PI
    } else if 
        (meteorRef.current.position.x < camera.position.x -10) {
            meteorRef.current.rotation.y = 0;
        }
     */
    if(meteorRef.current.rotation.y === 0 ) {
        meteorRef.current.position.x += 0.01;
        meteorRef.current.rotation.x += 0.005;
        meteorRef.current.position.z -= 0.01;
    } else {
        meteorRef.current.position.x -= 0.01;
        meteorRef.current.position.z += 0.01;
    }
            
}
)

  return (
    <mesh {...props} ref={meteorRef} position={[-1,0.7,1.5]} scale={[0.6, 0.6, 0.6]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Meteor
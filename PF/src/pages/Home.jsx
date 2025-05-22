import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader.jsx'
import  MainModel  from '../models/MainModel'

const Home = () => {
  const adjustModelForScreenSize = () => {
    let screenScale = null; 
    let screenPosition = null;
    let screenRotation = [0.1,0,0];

    if(window.innerWidth < 768) {
      screenScale = [0.9, 0.9, 0.9];
      screenPosition = [0, -2.5, 2];
    } else {
      screenScale = [1, 1, 1];
      screenPosition = [0, -2.5, 3];
    }

    return [screenScale, screenPosition, screenRotation];
  }

  const [modelScale, modelPosition, modelRotation] = adjustModelForScreenSize();
  return (
    <section className='w-full h-screen relative'>
      <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
        POPUP
      </div>
      <Canvas className='
      w-full h-screen bg-transparent'
      camera={{near: 0.1, far: 1000}}
      >
        <Suspense fallback={<Loader/>}>
        <directionalLight></directionalLight>
        <ambientLight></ambientLight>
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <hemisphereLight></hemisphereLight>
        <MainModel 
         position = {modelPosition}
         scale = {modelScale}
         rotation = {modelRotation}/>
        </Suspense>
      </Canvas>

    </section>
  )
}

export default Home
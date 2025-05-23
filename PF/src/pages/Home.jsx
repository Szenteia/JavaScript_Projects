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
      screenScale = [0.8, 0.8, 0.8];
      screenPosition = [0, -2.1, 2];
    } else {
      screenScale = [1.2, 1.2, 1.2];
      screenPosition = [0, -3.5, 2];
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
        <directionalLight position={[1,0.8,1]} intensity={4.5}/>
        <ambientLight intensity={0.6}/>
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={1}/>
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
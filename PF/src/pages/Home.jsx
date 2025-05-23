import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader.jsx'
/* import  MainModel  from '../models/MainModel' */
import AlternativeModel from '../models/AltModel.jsx'
import Sky from '../models/Sky.jsx'
import Plane from '../models/Plane.jsx'

const Home = () => {

  const [isRotating, setIsRotating] = useState(false);

  const adjustModelForScreenSize = () => {
    let screenScale = null; 
    let screenPosition = null;
    let screenRotation = [0.1,0,0];

    if(window.innerWidth < 768) {
      screenScale = [1.3, 1.3, 1.3];
      screenPosition = [0, -2.2, -1.1];
    } else {
      screenScale = [1.9, 1.9, 1.9];
      screenPosition = [0, -2.5, -2];
    }

    return [screenScale, screenPosition, screenRotation];
  }
  const adjustPlaneForScreenSize = () => {
    let screenScale ; 
    let screenPosition ;

    if(window.innerWidth < 768) {
      screenScale = [0.018,0.018,0.018];
      screenPosition = [0, -1.9, 0];
    } else {
      screenScale = [0.027,0.027,0.027];
      screenPosition = [0, -2, 0];
    }

    return [screenScale, screenPosition];
  }

  const [modelScale, modelPosition, modelRotation] = adjustModelForScreenSize();

  const [planeScale, planePosition]= adjustPlaneForScreenSize();

  return (
    <section className='w-full h-screen relative'>
      <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center text-white'>
        POPUP
      </div>
      <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`}
      camera={{near: 0.1, far: 1000}}
      >
        <Suspense fallback={<Loader/>}>
        <directionalLight position={[1,0.9,1]} intensity={5.7}/>
        <ambientLight intensity={0.7}/>
{/*         <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow /> */}
        <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={1}/>
        <Plane 
        isRotating ={isRotating}
        position ={planePosition}
        scale ={planeScale}
        rotation={[0,20.3,0]}
        />

        <Sky />

<AlternativeModel
         position = {modelPosition}
         scale = {modelScale}
         rotation = {modelRotation}
         isRotating={isRotating}
         setIsRotating={setIsRotating}
/>
{/*         <MainModel 
         position = {modelPosition}
         scale = {modelScale}
         rotation = {modelRotation}
         isRotating={isRotating}
         setIsRotating={setIsRotating}
         /> */}
        </Suspense>
      </Canvas>

    </section>
  )
}

export default Home
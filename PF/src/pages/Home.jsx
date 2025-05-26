import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader.jsx'
/* import  MainModel  from '../models/MainModel' */
import AlternativeModel from '../models/AltModel.jsx'
import Sky from '../models/Sky.jsx'
import Plane from '../models/Plane.jsx'
import Meteor from '../models/Meteor.jsx'

const Home = () => {

  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);

  const adjustModelForScreenSize = () => {
    let screenScale = null; 
    let screenPosition = null;
    let screenRotation = [0.1,0,0];

    if(window.innerWidth < 768) {
      screenScale = [1.1, 1.1, 1.1];
      screenPosition = [0, -1.1, -2.2];
    } else {
      screenScale = [1.5, 1.5, 1.5];
      screenPosition = [0, -1, -3.7];
    }

    return [screenScale, screenPosition, screenRotation];
  }
  const adjustPlaneForScreenSize = () => {
    let screenScale ; 
    let screenPosition ;

    if(window.innerWidth < 768) {
      screenScale = [0.018,0.018,0.018];
      screenPosition = [0, -2.6, 0];
    } else {
      screenScale = [0.023,0.023,0.023];
      screenPosition = [0, -2.85, 0];
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

        <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={2}/>
        <Plane 
        isRotating ={isRotating}
        position ={planePosition}
        scale ={planeScale}
        rotation={[0,20.3,0]}
        />
        <Meteor isRotating={isRotating}/>
        <Sky isRotating={isRotating}/>

<AlternativeModel
         position = {modelPosition}
         scale = {modelScale}
         rotation = {modelRotation}
         isRotating={isRotating}
         setIsRotating={setIsRotating}
         setCurrentStage={setCurrentStage}
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
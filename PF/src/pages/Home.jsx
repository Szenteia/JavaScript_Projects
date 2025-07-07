import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

// Lazy-loaded components
const Loader = lazy(() => import('../components/Loader.jsx'))
const AlternativeModel = lazy(() => import('../models/AltModel.jsx'))
const Sky = lazy(() => import('../models/Sky.jsx'))
const Plane = lazy(() => import('../models/Plane.jsx'))
const Meteor = lazy(() => import('../models/Meteor.jsx'))
const HomeInfo = lazy(() => import('../components/HomeInfo.jsx'))

import sakura from '../assets/sakura.mp3'
import { soundon } from '../assets/icons/index.js'
import { soundoff } from '../assets/icons/index.js'

const Home = () => {
  const audioRef = useRef(new Audio(sakura))
  audioRef.current.volume = 0.4
  audioRef.current.loop = true

  const [isRotating, setIsRotating] = useState(false)
  const [currentStage, setCurrentStage] = useState(1)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)

  useEffect(() => {
    if (isPlayingMusic) {
      audioRef.current.play()
    }

    return () => {
      audioRef.current.pause()
    }
  }, [isPlayingMusic])

  const adjustModelForScreenSize = () => {
    let screenScale = null
    let screenPosition = null
    let screenRotation = [0.1, 0, 0]

    if (window.innerWidth < 768) {
      screenScale = [1.1, 1.1, 1.1]
      screenPosition = [0, -1.1, -2.2]
    } else {
      screenScale = [1.5, 1.5, 1.5]
      screenPosition = [0, -1, -3.7]
    }

    return [screenScale, screenPosition, screenRotation]
  }

  const adjustPlaneForScreenSize = () => {
    let screenScale
    let screenPosition

    if (window.innerWidth < 768) {
      screenScale = [0.018, 0.018, 0.018]
      screenPosition = [0, -2.6, 0]
    } else {
      screenScale = [0.023, 0.023, 0.023]
      screenPosition = [0, -2.85, 0]
    }

    return [screenScale, screenPosition]
  }

  const [modelScale, modelPosition, modelRotation] = adjustModelForScreenSize()
  const [planeScale, planePosition] = adjustPlaneForScreenSize()

  return (
    <section className='w-full h-screen relative'>
      <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center text-white'>
        <Suspense fallback={<div>Loading info...</div>}>
          {currentStage && <HomeInfo currentStage={currentStage} />}
        </Suspense>
      </div>

      <Canvas
        className={`w-full h-screen bg-transparent ${
          isRotating ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        camera={{ near: 0.1, far: 1000 }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 0.9, 1]} intensity={5.7} />
          <ambientLight intensity={0.7} />
          <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={2} />

          <Plane
            isRotating={isRotating}
            position={planePosition}
            scale={planeScale}
            rotation={[0, 20.3, 0]}
          />

          <Meteor isRotating={isRotating} />
          <Sky isRotating={isRotating} />

          <AlternativeModel
            position={modelPosition}
            scale={modelScale}
            rotation={modelRotation}
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
          />
        </Suspense>
      </Canvas>

      <div className='absolute bottom-2 left-2'>
        <img
          src={!isPlayingMusic ? soundoff : soundon}
          alt='sound'
          className='w-10 h-10 cursor-pointer object-contain'
          onClick={() => setIsPlayingMusic(!isPlayingMusic)}
        />
      </div>
    </section>
  )
}

export default Home

/* eslint-disable no-unused-vars */


import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { a } from '@react-spring/three'

import MainModelScene from '../assets/3d/altModel-optimized.glb'

const AlternativeModel = ({ isRotating, setIsRotating, setCurrentStage, ...props}) => {
  const  mainModelRef = useRef();
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF(MainModelScene);
  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95; //rotation speed limiter

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    const clientX = e.touches 
    ? e.touches[0].clientX 
    : e.clientX;
lastX.current = clientX;
  }
    const handlePointerUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(false);
  }

    const handlePointerMove = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if(isRotating) { const clientX = e.touches 
    ? e.touches[0].clientX 
    : e.clientX;

    const delta = (clientX - lastX.current) / viewport.width;
    mainModelRef.current.rotation.y += delta * 0.01 * Math.PI;
    lastX.current = clientX;
    rotationSpeed.current = delta *0.01 * Math.PI;
  }}

  const handleKeyDown = (e) => {
    if(e.key === 'ArrowLeft') {
        if(!isRotating) setIsRotating(true);
        mainModelRef.current.rotation.y += 0.01 * Math.PI;
        rotationSpeed.current = 0.0125;
    } else if(e.key === 'ArrowRight') {        
        if(!isRotating) setIsRotating(true);
        mainModelRef.current.rotation.y -= 0.01 * Math.PI;
        rotationSpeed.current = -0.0125;
    }
  }

  const handleKeyUp = (e) => {
    if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setIsRotating(false);
    }
  }

  useFrame(() => {
    if(!isRotating){
        rotationSpeed.current *= dampingFactor;
        if(Math.abs(rotationSpeed.current) < 0.001){
            rotationSpeed.current = 0;
        }
        mainModelRef.current.rotation.y += rotationSpeed.current;
    } else {
        const rotation = mainModelRef.current.rotation.y;
        const normalizeRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        switch(true) {
            case normalizeRotation >= 5.45 && normalizeRotation <= 5.85 :
                setCurrentStage(4);
                break;
            case normalizeRotation >= 0.85 && normalizeRotation <= 1.3 :
                setCurrentStage(3);
                break;
            case normalizeRotation >= 2.4 && normalizeRotation <= 2.6 :
                setCurrentStage(2);
                break;
            case normalizeRotation >= 4.25 && normalizeRotation <= 4.75 :
                setCurrentStage(1);
                break;
                default:
                setCurrentStage(null);
        }
    }
  })
  useEffect(() => {
    const canvas = gl.domElement;
canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointerup', handlePointerUp);
canvas.addEventListener('pointermove', handlePointerMove);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('keydown', handleKeyDown);

return () => {
canvas.removeEventListener('pointerdown', handlePointerDown);
canvas.removeEventListener('pointerup', handlePointerUp);
canvas.removeEventListener('pointermove', handlePointerMove);
document.removeEventListener('keyup', handleKeyUp);
document.removeEventListener('keydown', handleKeyDown);
}
}, [gl, handlePointerDown, handlePointerUp, handlePointerMove])



  return (
    <a.group ref={mainModelRef} {...props} dispose={null}>
      <group scale={0.01}>
        <mesh
          geometry={nodes.SupportStructure_Beam1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}
        />
        <mesh
          geometry={nodes.SpaceStationCore_SpaceStation_Core_0.geometry}
          material={materials.SpaceStation_Core}
        />
        <mesh
          geometry={nodes.TurbineShielding_SpaceStation_Core_0.geometry}
          material={materials.SpaceStation_Core}
        />
        <mesh
          geometry={nodes.SpaceStationCore_InnerTurbineWings_SpaceStation_Core_0.geometry}
          material={materials.SpaceStation_Core}

        />
        <mesh
          geometry={nodes.SpaceStationCore_OuterTurbineWings_SpaceStation_Core_0.geometry}
          material={materials.SpaceStation_Core}

        />
        <mesh
          geometry={nodes.SupportStructure_Beam4_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}
        />
        <mesh
          geometry={nodes.SupportStructure_Beam3_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SupportStructure_Beam2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}
        />
        <mesh
          geometry={nodes.SpaceStationParts_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}
        />
        <mesh
          geometry={nodes.SurfaceBraces_Short1_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short4_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short3_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short2_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long4_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short4_4_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short4_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long4_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short4_3_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long1_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short1_4_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}
        />
        <mesh
          geometry={nodes.SurfaceBraces_Short1_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long1_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short1_3_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long3_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}


        />
        <mesh
          geometry={nodes.SurfaceBraces_Short3_4_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short3_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long3_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short3_3_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long2_2_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short2_4_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short2_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Long2_1_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
        <mesh
          geometry={nodes.SurfaceBraces_Short2_3_SpaceStation_Parts_0.geometry}
          material={materials.SpaceStation_Parts}

        />
      </group>
    </a.group>
  )
}


export default AlternativeModel;
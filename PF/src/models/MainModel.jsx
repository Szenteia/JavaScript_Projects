/* eslint-disable no-unused-vars */


import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { a } from '@react-spring/three'

import MainModelScene from '../assets/3d/large_tv_man.glb'

const MainModel = ({ isRotating, setIsRotating, setCurrentStage, ...props}) => {
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
    } else if(e.key === 'ArrowRight') {        
        if(!isRotating) setIsRotating(true);
        mainModelRef.current.rotation.y -= 0.01 * Math.PI;
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
    <a.group ref={mainModelRef} {...props} >
      <primitive object={nodes.GLTF_created_0_rootJoint} />
      <skinnedMesh
        geometry={nodes.Object_7.geometry}
        material={materials.TV_Small}
        skeleton={nodes.Object_7.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_8.geometry}
        material={materials.TV_Small_Screen_Off}
        skeleton={nodes.Object_8.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_9.geometry}
        material={materials.combine_intwallunit_sheet}
        skeleton={nodes.Object_9.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_10.geometry}
        material={materials.utility_poles001}
        skeleton={nodes.Object_10.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_12.geometry}
        material={materials.Boots_d}
        skeleton={nodes.Object_12.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_13.geometry}
        material={materials.pants_d}
        skeleton={nodes.Object_13.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_14.geometry}
        material={materials.Gloves_BM}
        skeleton={nodes.Object_14.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_15.geometry}
        material={materials.shirt_d}
        skeleton={nodes.Object_15.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_16.geometry}
        material={materials.tie_d}
        skeleton={nodes.Object_16.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_17.geometry}
        material={materials.Jacket_D}
        skeleton={nodes.Object_17.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_18.geometry}
        material={materials.silo_monitor}
        skeleton={nodes.Object_18.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_19.geometry}
        material={materials.screen}
        skeleton={nodes.Object_19.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Object_20.geometry}
        material={materials.TV_Small}
        skeleton={nodes.Object_20.skeleton}
      />
    </a.group>
  )
}

export default MainModel;
//"Sci-Fi Space Station: Rotor Nexus" (https://skfb.ly/oPZKM) by Harri Snellman is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
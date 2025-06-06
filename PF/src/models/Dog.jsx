/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Author: Ida Faber (https://sketchfab.com/Ida..Faber)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/shiba-inu-dog-80419f7e64e24afe97e0931b6aeee612
Title: Shiba Inu Dog
*/

import React, { useEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import scene from '../assets/3d/racoon_from_cotw_game.glb'

const Dog = ({currentAnimation, ...props}) => {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(scene);
  const { actions } = useAnimations(animations, group);

  useEffect(()=> {
    Object.values(actions).forEach((action) => action.stop());

    if(actions[currentAnimation])
    {
      actions[currentAnimation].play();
    }
    console.log(actions);
  }, [actions, currentAnimation])
   return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="cc9c540c278b45e4aa70afad568bf51cfbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Raccoon_Body" rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                <group name="racoon" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                  <group name="Object_6">
                    <primitive object={nodes._rootJoint} />
                    <skinnedMesh
                      name="Object_9"
                      geometry={nodes.Object_9.geometry}
                      material={materials.Raccoon_Body}
                      skeleton={nodes.Object_9.skeleton}
                    />
                    <skinnedMesh
                      name="Object_10"
                      geometry={nodes.Object_10.geometry}
                      material={materials.Mexican_Bobcat_Cards}
                      skeleton={nodes.Object_10.skeleton}
                    />
                    <group name="Object_8" rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
   )
}


export default Dog;
//credit: "Shiba Inu Dog" (https://skfb.ly/6QYIW) by Ida Faber is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
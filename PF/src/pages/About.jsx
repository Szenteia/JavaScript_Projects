import React from 'react'
import { skills } from '../constants'
import CTA from '../components/CTA'

const About = () => {
  return (
    <section className='max-container'>
      <h1 className='head-text'>Hello, I'm <span className='blue-gradient_text font-semibold drop-shadow'>András</span>
      </h1>

      <div className='mt-5 flex flex-col gap-3 text-slate-500'>
        <p>Software Engineer based in Hungary, I have a passion for gamification with programming, 3D visualization  and application programming.</p>
      </div>

      <div className='py-10 flex flex-col'>
      <h3 className='subhead-text'>My Skills</h3>
        <div className='mt-16 flex flex-wrap gap-12'>
    {skills.map((skill) => (
      <div className='block-container w-20 h-20'>
        <div className='btn-back rounded-xl'/>
        <div className='btn-front rounded-xl flex justify-center items-center'>
          <img src={skill.imageUrl} alt={skill.name}
          className='w-1/2 h-1/2 object-contain' />
        </div>
      </div>
    ))}
        </div>
      </div>

      <hr className='border-slate-200' />
      <CTA/>
      </section>
  )
}

export default About
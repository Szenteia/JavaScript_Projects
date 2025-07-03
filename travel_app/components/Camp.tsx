import React from 'react'
interface BjjProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  peopleJoined: string;
}
const BjjSite = ({backgroundImage, title, subtitle, peopleJoined}: BjjProps) => {
  return (
    <div className={`h-full w-full min-w-[1100px]  ${backgroundImage} lg:rounded-r-5xl 2xl:rounded-5xl`}> 
    <div className='flex h-full flex-col items-start justify-between p-6 lg:px-20 lg:py-10'></div>
    </div>
  )
} 

const Camp = () => {
  return (
    <section className='border-2 border-green-400 2xl:max-container relative flex flex-col py-10 lg:mb-10 lg:py-20 xl:mb-20'>
      <div className='hide-scrollbar flex h-[340px] w-full items-start justify-start gap-8 overflow-x-auto lg:h-[400px] xl:h-[640px]'>
        <BjjSite 
        backgroundImage="bg_bjj1"
        title="first"
        subtitle="first2"
        peopleJoined="30+ Joined"/>
        <BjjSite 
        backgroundImage="/bg_bjj2"
        title="second"
        subtitle="second2"
        peopleJoined="50+ Joined"/>
      </div>
    </section>
  )
}

export default Camp
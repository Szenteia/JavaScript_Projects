import React from 'react'
import Image from 'next/image'

interface BjjProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  peopleJoined: string;
}

const BjjSite = ({ backgroundImage, title, subtitle, peopleJoined }: BjjProps) => {
  return (
    <div className={`h-full min-w-[90%] sm:min-w-[600px] lg:min-w-[800px] ${backgroundImage} lg:rounded-r-5xl 2xl:rounded-5xl`}>
      <div className='flex h-full flex-col items-start justify-between p-6 lg:px-20 lg:py-10'>
        <div className='flex-center gap-4'>
          <div className='h-12 w-12 flex items-center justify-center rounded-full bg-green-50'>
            <Image
              src='/wrestling-svgrepo-com.svg'
              alt='map'
              width={26}
              height={26}
              className='invert'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <h4 className='bold-18 text-white'>{title}</h4>
            <p className='regular-14 text-white'>{subtitle}</p>
          </div>
        </div>
        <div className='flexCenter gap-6'>
          <p className='bold-16 md:bold-20 text-white'>{peopleJoined}</p>
        </div>
      </div>
    </div>
  )
}

const Camp = () => {
  return (
    <section className='2xl:max-container relative flex flex-col py-10 lg:mb-10 lg:py-20 xl:mb-20'>
      <div className='hide-scrollbar overflow-x-auto flex h-[340px] w-full items-start justify-start gap-8 lg:h-[400px] xl:h-[640px] px-4'>
        <BjjSite
          backgroundImage="bg_bjj1"
          title="Brazil Jiu Jitsu"
          subtitle="Afternoon classes"
          peopleJoined="20+ Joined" 
          />
        <BjjSite
          backgroundImage="bg_bjj2"
          title="Shoot Fight"
          subtitle="Evening boxing"
          peopleJoined="10+ Joined" 
          />
      </div>
      <div className='flexEnd mt-10 px-6 lg:-mt-60 lg:mr-6'>
        <div className='bg-green-50 p-8 lg:max-w-[500px] xl:max-w-[734] xl:rounded-5xl xl:px-16 xl:py-20 relative w-full overflow-hidden rounded-3xl'>
          <h2 className='regular-24 md:regular-32 2xl:regular-64 capitalize text-white'><strong>Feeling lost </strong>
            Don't know what to do in your free time?
            </h2>
            <p className='regular-14 xl:regular-16 mt-5 text-white'>
              Your time and effort here not going to waste, You can find courage, friendship, 
              companionship within our club. Anytime you feel to have a question we are happy to answer!
              We believe that You can feel yourself better after a hard training session.Feel free to try yourself in our <strong>Open Mat Session </strong> on every Saturday 11 AM!
            </p>
            <Image 
            src="/quote.svg"
            alt='camp-2'
            width={186}
            height={219}
            className='camp-quote'/>
        </div>
      </div>
    </section>
  )
}

export default Camp

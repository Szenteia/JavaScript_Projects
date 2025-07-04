import React from 'react'
import Image from 'next/image'

const Guide = () => {
  return (
<section className='felxCenter flex-col'>
  <div className='padding-container max-container w-full pb-24'>
    <Image 
    src="camp.svg"
    alt="camp"
    width={50}
    height={50}
    />
    <p className='regular-18 -mt-1 mb-3 text-green-50 bold-18'>WE ARE HERE FOR YOU

    </p>
    <div className='flex flex-wrap justify-between gap-5 lg:gap-10'>
      <h2 className='bold-40 xl:bold-64 xl:max-w-[390px]'>Guide You to our dojo</h2>
      <p className='regular-16 text-gray-30 xl:max-w-[520px]'>If You looking for a dojo nearby and haven't met with us before, we are happy to guide you here, to find us easily!</p>
    </div>
  </div>

  <div className='flexCenter max-container relative w-full'>
    <Image 
    src="/boat.png"
    alt='boat'
    width={1440}
    height={580}
    className='w-full object-cover object-center 2xl:rounded-5xl pl-1'/>
    <div className='absolute flex bg-white py-8 pl-6 pr-7 gap-3 rounded-3xl border shadow-md md:left-[5%] lg:top-20'>
      <Image 
      src="/meter.svg"
      alt='meter'
      width={16}
      height={158}
      className='h-full w-auto'/>
      <div className='flexBetween flex-col'>
        <div className='flex w-fulf flex-col'>
          <div className='flexBetween w-full'>
            <p className='regular-16 text-gray-20'>Destination</p>
            <p className='bold-16 text-green-50'>20 min</p>
            
          </div>
          <p className='bold-20 mt-2'>Dojo</p>
        </div>
        <div className='flex w-full flex-col'>
            <p className='regular-16 text-gray-20'>Start track</p>
            <h4 className='bold-20 mt-2 whitespace-nowrap'>Your position</h4>

        </div>
      </div>
    </div>
  </div>
</section>
  )
}

export default Guide
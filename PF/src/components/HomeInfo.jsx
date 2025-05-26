import React from 'react'
import { Link } from 'react-router-dom'
import arrow from '../assets/icons/arrow.svg' 

const InfoBox = ({text, link, btnText}) => (
    <div className="info-box">
        <p className='font-medium sm:text-xl text-center'>{text}</p>
    <Link className='neo-brutalism-white neo-btn'  to={link}>
    {btnText}
        <img src={arrow} alt="arrow" className='w-4 h-4 object-contain' />
    </Link>
    </div>
)

const renderContent = {
    1: (
        <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
             Hi, I am <span className='font-semibold'> András Szentei</span>
             <br />
             A Software Engineer from Hungary</h1>
    ),
        2: (
        <InfoBox
            text="Check the Skills what I picked up on this Journey"
            link="/about"
            btnText="Learn More"
        />
    ),
        3: (
        <InfoBox
            text="Different projects what shapes the good engineer. Curious about?"
            link="/projects"
            btnText="Look at my projects"
        />
    ),
        4: (
        <InfoBox
            text="Need a project done? I'm just a few clicks away"
            link="/contact"
            btnText="Contact Me"
        />
    ),
}

const HomeInfo = ({currentStage}) => {
  return renderContent[currentStage] || null;
}

export default HomeInfo
'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NAV_LINKS } from '@/constants'
import Button from './Button'
import gsap from 'gsap'

const Navbar = () => {
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(
      logoRef.current,
      { x: '-100%', opacity: 0 },
      {
        x: '0%',
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
      }
    )
    .to(logoRef.current, {
      rotate: 720,
      duration: 1.5,
      ease: 'power2.out',
    })
const interval = setInterval(() => {
    gsap.fromTo(
      logoRef.current,
      { rotate: 0 },
      {
        rotate: 720,
        duration: 1.5,
        ease: 'power2.out',
      }
    )
  }, 5000)

  return () => clearInterval(interval)
}, [])

  return (
    <nav className='flexBetween max-container padding-container relative z-20 py-2'>
      <Link href='/'>
        <div ref={logoRef}>
          <Image src='/newlogo2.svg' alt='logo' width={90} height={35} />
        </div>
      </Link>

      <ul className='hidden h-full gap-12 lg:flex'>
        {NAV_LINKS.map((link) => (
          <Link
            href={link.href}
            key={link.key}
            className='regular-16 text-grey-50 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold'
          >
            {link.label}
          </Link>
        ))}
      </ul>

      <div className='lg:flexCenter hidden'>
        <Button
          type='button'
          title='Login'
          icon='/user.svg'
          variant='btn_dark_green'
        />
      </div>
      <div>
        <Image 
        src='menu.svg'
        alt='menu'
        width={32}
        height={32}
        className='inline-block cursor-pointer lg:hidden'/>
      </div>
    </nav>
  )
}

export default Navbar

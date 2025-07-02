import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { NAV_LINKS } from '@/constants'
const Navbar = () => {
  return (
    <nav className='flexBetween max-container padding-container relative z-20 py-2'>
        <Link
        href="/">
          <Image src='/hilink-logo.svg' alt='logo' width={80} height={29} />
          <ul className='hidden h-full gap-12 lg:flex'>
            {NAV_LINKS.map((link)=>(
              <Link
              href={link.href} key={link.key}> {link.label}
              </Link>
            ))}
          </ul>
        </Link>
        </nav>
  )
}

export default Navbar
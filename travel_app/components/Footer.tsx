import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FOOTER_CONTACT_INFO, FOOTER_LINKS } from '@/constants'

const Footer = () => {
  return (
    <footer className='flexCenter mb-24'>
      <div className='padding-container max-container flex w-full flex-col gap-14'>
        <div className='flex flex-col items-start justify-center gap-[10%] md:flex-row'>
          <Link
          href="/" className='mb-10'>
            <Image 
            src="newlogo2.svg" alt='logo' width={74} height={36}/>
          </Link>
          <div className='flex flex-wrap gap-10 sd:justify-between md:flex-1'>
            {FOOTER_LINKS.map((columns)=>(
              <FooterColumn title={columns.title}>
                <ul className='regular-14 flex flex-col gap-4 text-gray-30'>
                  {columns.links.map((link)=>(
                    <Link href="/" key={link}>
                      {link}
                    </Link>
                  ))}
                </ul>
              </FooterColumn>
            ))}
            <div className='flex flex-col gap-5'>
              <FooterColumn title={FOOTER_CONTACT_INFO.title}>
                {FOOTER_CONTACT_INFO.links.map((link)=>(
                  <Link
                  href='/'
                  key={link.label}
                  className='flex gap-4 md:flex-col lg:flex-row'>
                    <p className='whitespace-nowrap'>{link.label}:</p>
                    <p className='medium-14 whitespace-nowrap'>{link.value}</p>
                  </Link>
                ))}
              </FooterColumn>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
type FooterColumnProps = {
  title: string;
  children: React.ReactNode;
}

const FooterColumn= ({title, children}: FooterColumnProps) => {
  return (
    <div className='flex flex-col gap-5'>
      <h4 className='bold-18 whitespace-nowrap'>{title}</h4>
      {children}
    </div>
  )
}
export default Footer
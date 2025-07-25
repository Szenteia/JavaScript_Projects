import React, { Suspense, useRef } from 'react'
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Canvas } from '@react-three/fiber';
import  Loader  from '../components/Loader';
import Dog from '../models/Dog'
import useAlert from '../hooks/useAlert';
import Alert from '../components/Alert';


const Contact = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({name: '', email:'', message: '' })

  const [isLoading, setIsLoading] = useState(false)

  const [currentAnimation, setCurrentAnimation] = useState('racoon|idle pose');

  const { alert, showAlert, hideAlert } = useAlert();

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: 
      e.target.value })
  };

const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true)
    setCurrentAnimation('racoon|idle alerted pose');
  emailjs.send(
 import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
 import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
  {
    from_name: form.name,
    to_name: "András",
    from_email: form.email,
    message: form.message
  },
  import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
  //because it is async we need to call .then!
  ).then(()=> {
    setIsLoading(false);
        showAlert({
      show: true,
      text: 'Message sent successfully',
      type: 'success'
    })
    setTimeout(()=>{
    hideAlert();
    setCurrentAnimation('racoon|idle smell')
    setForm({ name:'', email:'', message:''});
    }, [3000])


  }).catch((error)=> {
    setIsLoading(false);
    setCurrentAnimation('racoon|idle pose');
    console.log(error);
      showAlert({
      show: true,
      text: 'I didnt recieve your message',
      type: 'danger'
    })
  }) 
};

  const handleFocus= () => {
    setCurrentAnimation('racoon|idle stretch');
  };
  const handleBlur = () => {setCurrentAnimation('racoon|idle pose')};


  return (
    <section className='relative flex lg:flex-row flex-col max-container h-[100vh]'>
      {alert.show && <Alert {...alert}/> }
      
      <div className='flex-1 min-w-[50%] flex-col'>
        <h1 className='head-text'>Get in Touch</h1>
        <form 
        className='w-full flex flex-col gap-7 mt-14'
        onSubmit={handleSubmit}
        ref={formRef}>
          <label className='text-black-500 font-semibold'>Name
            <input 
            type="text" 
            name='name'  
            className='input' 
            placeholder='John Doe' 
            required 
            value={form.name}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            />
          </label>
                    <label className='text-black-500 font-semibold'>Email
            <input 
            type="email" 
            name='email'  
            className='input' 
            placeholder='John@email.com' 
            required 
            value={form.email}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}/>
          </label>
                    <label className='text-black-500 font-semibold'>Your Message
            <textarea 
            rows={4}
            name='message'  
            className='textarea' 
            placeholder='Dear András...' 
            required 
            value={form.message}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}/>
          </label>
          <button
          type='submit'
          className='btn'
          disabled={isLoading}
          onFocus={handleFocus}
          onBlur={handleBlur}> 
          {isLoading ? 'Sending...': 'Send Message'}
          </button>
        </form>
      </div>
      <div className='lg:w-1/2 w-full lg:h-auto md:h-[550px] h-[350px]'>
      <Canvas camera={{
        position: [0, 0 ,5],
        fov: 55,
        near: 0.1,
        far: 1000

        }}>
          <directionalLight intensity={2.5} position={[0,0,0.6]}/>
          <ambientLight intensity={0.5}/>
          <Suspense fallback={<Loader/>}>
          <Dog 
          currentAnimation={currentAnimation}
          
          position={[0.5,0.55,2.5]}
          rotation={[12.7,-0.6,0]}
          
          />
          </Suspense>
      </Canvas>
      </div>
    </section>
  )
}

export default Contact
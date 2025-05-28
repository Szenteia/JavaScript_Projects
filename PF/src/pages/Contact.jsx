import React, { useRef } from 'react'
import { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({name: '', email:'', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  };

  const handleFocus= (e) => {
    e.preventDefault();
    setIsLoading(true)
  };
  const handleBlur = () => {};
const handleSubmit = () => {

  emailjs.send(
 import.meta.env.Vite_App_EMAILJS_SERVICE_ID,
 import.meta.env.Vite_App_EMAILJS_TEMPLATE_ID,
  {
    from_name: form.name,
    to_name: "András",
    form_email: "szenteia@gmail.com",
    message: form.message
  },
  import.meta.env.Vite_App_EMAILJS_PUBLIC_KEY
  //because it is async we need to call .then!
  ).then(()=> {
    setIsLoading(false);
    setForm({ name:'', email:'', message:''});
    //TODO: show success message, hide alert
  }).catch((error)=> {
    setIsLoading(false);
    console.log(error);
    //TODO show error message
  }) 

};
  return (
    <section className='relative flex lg:flex-row flex-col max-container'>
      <div className='flex-1 min-w-[50%] flex-col'>
        <h1 className='head-text'>Get in Touch</h1>
        <form 
        className='w.full flex flex-col gap-7 mt-14'
        onSubmit={handleSubmit}>
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
            onBlur={handleBlur}/>
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
          disabled={isLoading}
          className='btn'
          onFocus={handleFocus}
          onBlur={handleBlur}> {isLoading ? 'Sending...': 'Send Message'}</button>
        </form>
      </div>
    </section>
  )
}

export default Contact
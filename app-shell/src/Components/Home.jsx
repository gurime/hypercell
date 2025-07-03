import React, { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import {  useNavigate } from 'react-router';
// import CreateNote from './CreateNote';

export default function Home() {
const navigate = useNavigate();



  return (
    <>
      <Navbar/>
     {/* <CreateNote/> */}
      <Footer/>
    </>
  )
}
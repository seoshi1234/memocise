import React from 'react'
import './LandingPage.css'
import { Button } from '@chakra-ui/react'
import {User} from '@firebase/auth'

interface LandingPageProps{
  onSignUpOpen:()=>void,  
  onSignInOpen:()=>void
}

function LandingPage(props:LandingPageProps) {
  return (
    <div className="landingPage">
      <div className="landingPage__contents">
        <p className="landingPage__logo">Memocise</p>
        <p className="landingPage__text">당신의 운동을 기록하세요.</p>
        <Button colorScheme='teal' mt={4} onClick={props.onSignUpOpen}>3초만에 회원가입하기!</Button>
        <div className='outlineBtn' onClick={props.onSignInOpen}>이미 계정이 있으신가요?</div>
      </div>
      
      
    </div>
  )
}

export default LandingPage
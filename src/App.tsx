import React, { useEffect, useState } from 'react';
import { arrayUnion, auth,db } from './firebase';
import {User} from '@firebase/auth'
import logo from './logo.svg';
import './App.css';
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react'
import {ExercisePlan} from './Models/ExerciseModel';
import LandingPage from './Pages/LandingPage';
import MainPage from './Pages/MainPage';


function App() {

  
  const {  isOpen:isSignInOpen, onOpen:onSignInOpen, onClose:onSignInClose } = useDisclosure();
  const {  isOpen:isSignUpOpen, onOpen:onSignUpOpen, onClose:onSignUpClose } = useDisclosure();
  const [email,setEmail] = useState<string>();
  const [password,setPassword] = useState<string>();
  const [confirmPassword,setConfirmPassword] = useState<string>();  
  let isSignUpError = password !== confirmPassword || email === '' || password === '';
  let isSignInError = email === '' || password === '';
  const [user,setUser] = useState<User|null>(null);    

  const signUp = (event)=>{
    event.preventDefault();
    if(isSignUpError) return;

    auth.createUserWithEmailAndPassword(email, password)
    .then((authUser)=>{
      onSignUpClose();          
      db.collection('users').doc(authUser.user.uid).set({
        email:authUser.user.email               
      })            
    })
    .catch((error)=>{
      alert(error.message)
      console.log(error)
    })
    onSignUpClose();
  }

  const signIn = (event)=>{
    event.preventDefault();
    if(isSignInError) return;

    auth.signInWithEmailAndPassword(email,password)
    .then(()=>{
      onSignInClose();          
    })
    .catch((error)=>{
      alert(error.message);
      console.log(error);
    });    
    onSignInClose();
  }
  

  useEffect(()=>{
    auth.onAuthStateChanged((authUser)=>{
      if(authUser){
        setUser(authUser);   
        
      }else{
        setUser(null);
      }
    })
  },[user]);

  

  return (
    <div className="App">
      {
        user?
        <MainPage user={user} signOut={()=>auth.signOut()}/>
        :
        <LandingPage onSignUpOpen={onSignUpOpen} onSignInOpen={onSignInOpen}></LandingPage>
      }
      
      <Modal isOpen={isSignUpOpen} onClose={onSignUpClose}>
        <ModalOverlay />
        <ModalContent>
          <FormControl isInvalid={isSignUpError}>
            <ModalHeader>3초 회원가입</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Input mb={4} placeholder='이메일' onChange={(e)=>setEmail(e.target.value)} value={email} id='email' type='email'></Input>                
                <Input mb={2} id='password' type='password' placeholder='비밀번호' onChange={(e)=>setPassword(e.target.value)} value={password}></Input>                
                <Input id='confirmPassword' type='password' placeholder='비밀번호 한번더!' onChange={(e)=>setConfirmPassword(e.target.value)}></Input>
                {
                  email===''?
                  <FormErrorMessage>이메일을 입력하세요!</FormErrorMessage>:
                  password===''?
                  <FormErrorMessage>비밀번호를 입력하세요!</FormErrorMessage>:
                  password!==confirmPassword?
                  <FormErrorMessage>비밀번호가 같아야되요!</FormErrorMessage>:
                  <></>
                }
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='teal' mr={3} onClick={signUp} type='submit'>
                가입하기
              </Button>
              <Button colorScheme='red'  onClick={onSignUpClose}>
                닫기
              </Button>            
            </ModalFooter>
          </FormControl>            
        </ModalContent>
      </Modal>
      <Modal isOpen={isSignInOpen} onClose={onSignInClose}>
        <ModalOverlay />
        <ModalContent>
          <FormControl isInvalid={isSignInError}>
            <ModalHeader>로그인</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Input mb={4} placeholder='이메일' onChange={(e)=>setEmail(e.target.value)} value={email} id='email' type='email'></Input>                
                <Input mb={2} id='password' type='password' placeholder='비밀번호' onChange={(e)=>setPassword(e.target.value)} value={password}></Input>                                
                {
                  email===''?
                  <FormErrorMessage>이메일을 입력하세요!</FormErrorMessage>:
                  password===''?
                  <FormErrorMessage>비밀번호를 입력하세요!</FormErrorMessage>:                  
                  <></>
                }
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='teal' mr={3} onClick={signIn} type='submit'>
                로그인
              </Button>
              <Button colorScheme='red'  onClick={onSignInClose}>
                닫기
              </Button>            
            </ModalFooter>
          </FormControl>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default App;

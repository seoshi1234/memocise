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
import {ExercisePlan} from './Models/ExerciseTypes';
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
            <ModalHeader>3??? ????????????</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Input mb={4} placeholder='?????????' onChange={(e)=>setEmail(e.target.value)} value={email} id='email' type='email'></Input>                
                <Input mb={2} id='password' type='password' placeholder='????????????' onChange={(e)=>setPassword(e.target.value)} value={password}></Input>                
                <Input id='confirmPassword' type='password' placeholder='???????????? ?????????!' onChange={(e)=>setConfirmPassword(e.target.value)}></Input>
                {
                  email===''?
                  <FormErrorMessage>???????????? ???????????????!</FormErrorMessage>:
                  password===''?
                  <FormErrorMessage>??????????????? ???????????????!</FormErrorMessage>:
                  password!==confirmPassword?
                  <FormErrorMessage>??????????????? ???????????????!</FormErrorMessage>:
                  <></>
                }
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='teal' mr={3} onClick={signUp} type='submit'>
                ????????????
              </Button>
              <Button colorScheme='red'  onClick={onSignUpClose}>
                ??????
              </Button>            
            </ModalFooter>
          </FormControl>            
        </ModalContent>
      </Modal>
      <Modal isOpen={isSignInOpen} onClose={onSignInClose}>
        <ModalOverlay />
        <ModalContent>
          <FormControl isInvalid={isSignInError}>
            <ModalHeader>?????????</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Input mb={4} placeholder='?????????' onChange={(e)=>setEmail(e.target.value)} value={email} id='email' type='email'></Input>                
                <Input mb={2} id='password' type='password' placeholder='????????????' onChange={(e)=>setPassword(e.target.value)} value={password}></Input>                                
                {
                  email===''?
                  <FormErrorMessage>???????????? ???????????????!</FormErrorMessage>:
                  password===''?
                  <FormErrorMessage>??????????????? ???????????????!</FormErrorMessage>:                  
                  <></>
                }
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='teal' mr={3} onClick={signIn} type='submit'>
                ?????????
              </Button>
              <Button colorScheme='red'  onClick={onSignInClose}>
                ??????
              </Button>            
            </ModalFooter>
          </FormControl>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default App;

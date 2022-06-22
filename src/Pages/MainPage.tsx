import React, { useEffect, useState } from 'react'
import './MainPage.css'
import 
{Button,useDisclosure,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText
} from '@chakra-ui/react'
import Exercise from '../Components/Exercise'
import { ArrowUpIcon } from '@chakra-ui/icons';
import { arrayUnion, db } from '../firebase';
import {User} from '@firebase/auth'
import { ExercisePlan } from '../Models/ExerciseTypes';


interface MainPageProps{   
  user:User,
  signOut:()=>void,  
}



function MainPage(props:MainPageProps) {
  const [exerciseDocs,setExerciseDocs] = useState<Array<[string,ExercisePlan]>|null>(null);
  const {  isOpen:isExerciseFormOpen, onOpen:onExerciseFormOpen, onClose:onExerciseFormClose } = useDisclosure();
  const [name,setName] = useState<string>('');
  const [restDuration,setRestDuration] = useState<string>();    
  const [refresh,setRefresh] = useState<boolean>(false);
  const isExerciseFormError = name===''||restDuration===''||Number(restDuration)<0;

  const refreshPage = ()=>setRefresh(!refresh);

  const addExercise=async ()=>{
    if(isExerciseFormError) return;
    let newExercise:ExercisePlan = {name:name,records:[],restDuration:Number(restDuration)}
    let reference = await db.collection('exercises').add(newExercise);
    await db.collection('users').doc(props.user.uid).update({exercises:arrayUnion(reference.id)});
    refreshPage();    
    onExerciseFormClose();   
  }

  

  

  useEffect(()=>{    
    console.log(refresh);
    db.collection('users').doc(props.user.uid).onSnapshot(async snapshot=>{
      let exerciseIDs = snapshot.data().exercises;
      setExerciseDocs(await Promise.all(exerciseIDs.map(el=>{
        return (async function(el){
          let exerciseSnapshot = await (await (db.collection('exercises').doc(el).get()));
          let exercise = exerciseSnapshot.data();
          return [exerciseSnapshot.id,exercise];
        })(el); 
      })));
    });    
  },[refresh])

  return (
    <div className="mainPage">
      <div className="mainPage__header">
        <Button colorScheme='teal' onClick={props.signOut}>로그아웃하기</Button>
      </div>
      <div className="mainPage__exercises">
        {
          exerciseDocs?
          exerciseDocs.map((exerciseDoc,i)=>{  
            if(exerciseDoc[1]){
              return <Exercise user={props.user} refresh={refresh} refreshPage={refreshPage} exercise={exerciseDoc[1]} exerciseID={exerciseDoc[0]} key={i} />
            }          
          })
          :
          <></>
        }
        <Exercise exercise={null} onExerciseFormOpen={onExerciseFormOpen}/>
      </div>

      
      <Modal isOpen={isExerciseFormOpen} onClose={onExerciseFormClose}>
        <ModalOverlay />
        <ModalContent>
          <FormControl isInvalid={isExerciseFormError}>
            <ModalHeader>운동 추가하기</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input mb={4} placeholder='운동 이름' onChange={(e)=>setName(e.target.value)} defaultValue={name} id='name'></Input>                
              <NumberInput mb={2} id='restDuration' defaultValue={0} onChange={(value)=>setRestDuration(value)} >
                <NumberInputField/>
                <NumberInputStepper>
                  <NumberIncrementStepper/>
                  <NumberDecrementStepper/>
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText><ArrowUpIcon/> 세트간 휴식시간 (단위:초)</FormHelperText>
              {
                name===''?
                <FormErrorMessage>운동  이름을 입력하세요!</FormErrorMessage>:
                restDuration===''?
                <FormErrorMessage>세트간 휴식시간을 입력하세요!</FormErrorMessage>:                
                Number(restDuration)<0?                
                <FormErrorMessage>휴식시간이 0초 이상이어야 되요!</FormErrorMessage>:                
                <></>
              }
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='teal' mr={3} type='submit' onClick={addExercise}>
                추가하기
              </Button>
              <Button colorScheme='red'  onClick={onExerciseFormClose}>
                닫기
              </Button>            
            </ModalFooter>
          </FormControl>
        </ModalContent>
      </Modal>
    </div>    
  )
}

export default MainPage
import 
{ 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  IconButton,
  Input,
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  Box,
  useDisclosure,
  Divider,
  Checkbox} 
from '@chakra-ui/react'
import {
  DeleteIcon
} from '@chakra-ui/icons'
import './Exercise.css'
import React, { useEffect, useState } from 'react'
import {AddIcon,ArrowUpIcon} from '@chakra-ui/icons'
import {ExercisePlan,ExerciseRecord} from '../Models/ExerciseModel'
import { arrayRemove, arrayUnion, db } from '../firebase'
import Record from './Record'
import {User} from '@firebase/auth'


interface ExerciseProps{
  refresh?:boolean,
  user?:User,
  onExerciseFormOpen?:()=>void,
  refreshPage?:()=>void,
  exerciseID?:string,
  exercise:ExercisePlan|null
}

function Exercise(props:ExerciseProps) {
  const {isOpen:isConfirmDeleteOpen, onOpen:onConfirmDeleteOpen,onClose:onConfirmDeleteClose} = useDisclosure();
  const [name,setName] = useState(props.exercise?.name);
  const [restDuration,setRestDuration] = useState<string>(props.exercise?.restDuration.toString());
  const [recordDocs,setRecordDocs] = useState<Array<[string,ExerciseRecord]>|null>(null);
  const [loadCount,setLoadCount] = useState<number>(5);  
  
  const addRecord= async ()=>{
    let newRecord:ExerciseRecord = {counts:[0],currentSet:1,day:recordDocs.length+1};
    console.time('a');
    let reference = await db.collection('records').add(newRecord);
    await db.collection('exercises').doc(props.exerciseID).update({records:arrayUnion(reference.id)});
    console.timeEnd('a')
    props.refreshPage();
  }
  
  const modifyExerciseSetting = ()=>{
    db.collection('exercises').doc(props.exerciseID).update({name:name,restDuration:restDuration});
  }

  const deleteExercise = async ()=>{
    onConfirmDeleteClose();
    await db.collection('users').doc(props.user.uid).update({exercises: arrayRemove(props.exerciseID)});
    
    await Promise.all(recordDocs.map(recordDoc=>{
      return async function(){
        await db.collection('records').doc(recordDoc[0]).delete();
      }
      ();
    }));
    await db.collection('exercises').doc(props.exerciseID).delete();
    console.log(props.exerciseID);
    props.refreshPage();
  }

  useEffect(()=>{
    setName(props.exercise?.name);
    setRestDuration(props.exercise?.restDuration.toString());
    (async function() {
      if(props.exercise?.records){
        db.collection('exercises').doc(props.exerciseID).onSnapshot(async snapshot=>{
          let recordDocuments = await Promise.all(snapshot.data().records?.map((el)=>{
            return (async function (el) {
              let recordSnapshot = await (await (db.collection('records').doc(el).get()));          
              let record = recordSnapshot.data();
              return [recordSnapshot.id,record as ExerciseRecord];
            })(el);
          }));
          setRecordDocs(recordDocuments?.sort((a,b)=>b[1].day-a[1].day));
        })
        console.log(recordDocs);
      }
    })()
  },[props.refresh])
  

  const isExerciseFormError = name===''||restDuration===''||Number(restDuration)<0;
  return (
    
    <div className={`exercise ${props.exercise?'':'empty'}`}>
      {
        props.exercise?
        <div className="exercisePlan">
          <FormControl mb={3} className='exercisePlan__exerciseForm' isInvalid={isExerciseFormError}>
            {
              name===''?
              <FormErrorMessage>운동  이름을 입력하세요!</FormErrorMessage>:
              restDuration===''?
              <FormErrorMessage>세트간 휴식시간을 입력하세요!</FormErrorMessage>:                
              Number(restDuration)<0?                
              <FormErrorMessage>휴식시간이 0초 이상이어야 되요!</FormErrorMessage>:                
              <></>
            }
            <NumberInput w={20} h={10} mr={[2,4]}id='loadCount' value={loadCount} onChange={(value)=>setLoadCount(Number(value))} >
              <NumberInputField/>
              <NumberInputStepper>
                <NumberIncrementStepper/>
                <NumberDecrementStepper/>
              </NumberInputStepper>
            </NumberInput> 개 불러오기
            <Box w={'100%'} h={2}/>
            <Input w={['40%','40%']}  mr={[2,4]} placeholder='운동 이름' onChange={(e)=>setName(e.target.value)} value={name} id='name'></Input>                
            <Box w={['40%','20%']} mr={[2,4]} className="exercise__numberInput">
              <NumberInput w={'100%'} mr={[2,4]}id='restDuration' value={restDuration} onChange={(value)=>setRestDuration(value)} >
                <NumberInputField/>
                <NumberInputStepper>
                  <NumberIncrementStepper/>
                  <NumberDecrementStepper/>
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText><ArrowUpIcon/> 세트간 휴식시간 (단위:초)</FormHelperText>
            </Box>
            <Box w={['100%','0%']} h={2}/>
            <Button colorScheme='teal' mr={[2,4]} type='submit' onClick={modifyExerciseSetting}>
              저장하기
            </Button>
            <IconButton colorScheme={'red'} aria-label={'Delete Exercise'} icon={<DeleteIcon/>} onClick={onConfirmDeleteOpen}/>
          </FormControl>
          <Divider w={'100%'}/>
          {
            
            recordDocs?.map((el,i)=>{
              console.log(el[1].day);
              if(i <= loadCount-1)
              return (
              <>
                <Record recordID={el[0]} record={el[1]} key={i} refreshPage={props.refreshPage} restDuration={Number(restDuration)} isRecent={i==0}/>
                <Divider w={'100%'}/>
              </>
              );
              else
              return(<></>);
            })
          }
          <Record record={null} addRecord={addRecord}/>
          <Modal isOpen={isConfirmDeleteOpen} onClose={onConfirmDeleteClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>정말 삭제하시겠습니까?</ModalHeader>
              <ModalCloseButton />              
              <ModalFooter>
                <Button colorScheme='teal' mr={3} onClick={deleteExercise}>
                  예
                </Button>
                <Button colorScheme='red'  onClick={onConfirmDeleteClose}>
                  아니오
                </Button>            
              </ModalFooter>              
            </ModalContent>
          </Modal>
        </div>
        :
        <Button colorScheme='teal' onClick={props.onExerciseFormOpen}>운동 추가하기&nbsp;<AddIcon/></Button>
      }
    </div>
  )
}

export default Exercise
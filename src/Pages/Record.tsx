import React, { useEffect, useState } from 'react'
import './Record.css'
import 
{
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
  FormLabel,
  Collapse,
  FormHelperText,
  Box,
  useDisclosure,
  Divider,
  Heading
}from '@chakra-ui/react'
import 
{
  AddIcon, ChevronDownIcon, ChevronUpIcon
}from '@chakra-ui/icons'
import {ExerciseRecord} from '../Models/ExerciseModel'
import { arrayUnion, db } from '../firebase'
interface RecordProps{
  recordID?:string,
  record :ExerciseRecord|null,
  isRecent?:boolean,
  addRecord? :()=>void,
  refreshPage?:()=>void,
  restDuration?:number,
}

function Record(props:RecordProps) {  
  
  const [counts, setCounts] = useState<Array<number>>(props.record?.counts);
  const [isAdding,setIsAdding] = useState<boolean>(false);  
  const [timer,setTimer] = useState<number>(0);
  const [timerHandler,setTimerHandler] = useState<NodeJS.Timer>();
  const [isCollapsed,setIsCollapsed] = useState<boolean>(true);
  
  const isRecordFormError = counts && counts[counts.length-1]<=0;

  const reduceTimer = ()=>{
    setTimer(prevTimer=>prevTimer-1);    
  }

  const addSet = ()=>{
    if(isRecordFormError) return;
    let newCounts = [...counts];    
    newCounts.push(0);    
    setIsAdding(true);
    db.collection('records').doc(props.recordID).update({counts:newCounts}).then(()=>{
      props.refreshPage();
      setCounts(newCounts);
      setIsAdding(false);
      setTimer(props.restDuration);
    });
  }

  const saveCurrentSet = ()=>{
    if(isRecordFormError) return;
    let newCounts = [...counts];    
    db.collection('records').doc(props.recordID).update({counts:newCounts});
  }
  
  useEffect(()=>{
    if(timer == props.restDuration){
      setTimerHandler(setInterval(reduceTimer,1000));
    }
    if(timer < 0){      
      clearInterval(timerHandler);
    }
  },[timer]);
  
  useEffect(()=>{
    if(isRecordFormError) return;
    if(!counts)return;
    saveCurrentSet();
  },[counts])  

  useEffect(()=>{
    setCounts(props.record?.counts)
    setTimer(0);
  },[props.record?.day])

  return (
    <div className={`record ${props.record?'':'empty'}`}>
      {
        props.record?
        <FormControl className='recordForm' isInvalid={isRecordFormError}>
            <Button mr={3} colorScheme={'teal'} onClick={()=>setIsCollapsed(!isCollapsed)}>
              {
                isCollapsed?
                <><ChevronDownIcon/>펼치기</>
                :
                <><ChevronUpIcon/>접기</>
              }
            </Button>
            <div className="recordHeader">
              <Heading as={'h5'} fontSize={'large'} mr={2}>{props.record.day}일차</Heading> {counts.length}세트 / 총 {counts.reduce((a,b)=>a+b,0)}개
            </div> 
            <Collapse in={!isCollapsed} style={{width:'100%'}}>
              <Box w={'100%'} h={3}/>
              {
                counts.map((el,i)=>{
                  if(i < counts.length -1)
                  return(
                    <Box key={i}>
                      {i+1}세트 ({el}번수행)
                      <Box w={'100%'} h={2}/>
                    </Box>
                  )
                })
              }
              {
                isRecordFormError&&props.isRecent?
                <FormErrorMessage>한번 이상은 하셔야되요!</FormErrorMessage>:
                <></>
              }
              <Box w={'100%'} h={2}/>
              <FormLabel htmlFor='count'>{counts.length}세트 ({counts[counts.length-1]}번수행)</FormLabel>
              {
                props.isRecent?
                <>
                  <Box w={'100%'} h={2}/>
                  <NumberInput w={['40%','30%']} mr={4} mb={4}id='count' value={counts[counts.length-1]}
                    onChange={(value)=>{
                      let newCounts = [...counts];
                      newCounts[counts.length-1]=Number(value);
                      setCounts(newCounts);
                    }} >
                    <NumberInputField/>
                    <NumberInputStepper>
                      <NumberIncrementStepper/>
                      <NumberDecrementStepper/>
                    </NumberInputStepper>
                  </NumberInput>
                  <Button isLoading={isAdding||timer>0} loadingText={timer>0?timer.toString():''} colorScheme='teal' mr={4} type='submit' onClick={addSet}>
                    한세트 더!
                  </Button>
                </>
                :
                <></>
              }
            </Collapse>                        
          </FormControl>
        :
        <Button colorScheme='teal' onClick={props.addRecord}>기록 추가하기&nbsp;<AddIcon/></Button>
      }
    </div>
  )
}

export default Record
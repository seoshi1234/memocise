export interface ExercisePlan{
  name:string,
  records:Array<string>
  restDuration:Number
}
export interface ExerciseRecord{
  counts:Array<number>
  currentSet:number
  day:number
}

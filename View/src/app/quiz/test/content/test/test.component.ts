import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { TestService } from 'src/app/quiz/shared/services/test.service';
import { Question, QuestionStatus, Subject } from 'src/app/quiz/shared/models/classes';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  questions: Question[] = [];
  questions1 = Question;
  questionStatuses: QuestionStatus[] = [];
  status = new QuestionStatus;
  idSubject:string;
  subject:Subject=new Subject();
  actualTime;
  idUser:string;
  public timeLeft:string = "00:00:00";

  constructor(private testService: TestService, private router:Router,
     private route:ActivatedRoute, private cookie:CookieService) {

  }



  ngOnInit() {
    this.idSubject=this.cookie.get('idSubject');
    this.idUser = (JSON.parse(this.cookie.get('user')).id);

    console.log("ids",this.idUser," ", this.idSubject)
    this.testService.getRandQuestionsByIdSubject(this.idSubject).subscribe(x => {
      console.log(x);

      this.questions = x;

      this.questions.forEach(
        question => {
          let  questionStatus = new QuestionStatus();
          questionStatus.id = question.id;
          this.questionStatuses.push(questionStatus);
        }
      );

    });
    this.subject.limitedTime=JSON.parse(this.cookie.get("time")).limitedTime;
    this.subject.time=JSON.parse(this.cookie.get("time")).time;
    console.log("lt", JSON.parse(this.cookie.get("time")).limitedTime)
    if (this.subject.limitedTime){
    this.timer(this.subject.time);
  }
  }



  public onChange(questionStatus: QuestionStatus) {
    let exist = false;
    let i = 0;
    let id = 0;
    this.questionStatuses.forEach(element => {
        if (element.id === questionStatus.id) {
          //element = answerStatus;
          exist = true;
          id = i;
        }
        i++;
      }
    );

    if (exist) {
      this.questionStatuses[id] = questionStatus;
    }


  }

  onSubmit(){
    console.log("que: ",this.questionStatuses," iduser: ",this.idUser," idsubj: ",this.idSubject);
    this.testService.checkAnswers(this.questionStatuses,this.idUser,this.idSubject).subscribe(x =>
      {

        this.testService.setResult(x);
        this.router.navigate(['../end'], { relativeTo: this.route });
      });

  }

  public timer (time){
  
    this.actualTime = new Date().getTime();
    let endTime = this.actualTime + time * 60 * 1000;
    let x = setInterval(()=> {
      
      let timeleft = Math.floor( endTime - (new Date().getTime()));
      if(timeleft<=0) {this.onSubmit();
      return;}
      let hoursN = Math.floor(timeleft/(1000*60*60));
      let minutesN = Math.floor((timeleft % (1000*60*60))/(1000*60));
      let secundesN = Math.floor((timeleft % (1000*60))/(1000));

      let hours = String(hoursN);
      let minutes = String(minutesN);
      let secundes = String(secundesN);

      if(hoursN<10) hours = "0"+ String(hoursN);
      if(minutesN<10) minutes = "0"+ String(minutesN);
      if(secundesN<10) secundes = "0"+ String(secundesN);
      
      console.log("t---l", timeleft.toString());
      this.timeLeft = hours+":"+minutes+":"+secundes;
    }, 1000);

  }

}

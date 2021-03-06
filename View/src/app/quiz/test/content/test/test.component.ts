import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
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

  questionStatuses: QuestionStatus[] = [];
  status = new QuestionStatus;
  idSubject: string;
  subject: Subject = new Subject();
  actualTime;
  idUser: string;
  isSubmitted: boolean = false;
  subjectObj: Subject;
  public timeLeft: string = "00:00:00";
  markNumber: number[] ;
  timerHandler;
  questionIndex: number = 0;
  firstQuestion: boolean = true;
  lastQuestion: boolean = false;
  constructor(private testService: TestService, private router: Router,
    private route: ActivatedRoute, private cookie: CookieService) {

  }

  

  ngOnInit() {
    window.scroll(0,0);
    if (this.cookie.get('user') == "") {
      let markNumber:string=JSON.parse(this.cookie.get("markTable"))+'';
      this.markNumber=markNumber.split(",").map(Number);
    //  if (window.location.href.split('/')[4] == 'demo' || window.location.href.split('/')[5] == 'demo')
      if (window.location.href.split('/').includes('demo'))
      {
        this.idSubject = this.cookie.get('idSubject')
        this.subjectObj = JSON.parse(this.cookie.get("subj"));
        this.testService.getQuestionsByIdSubjectDemoWOStatus(this.idSubject).subscribe(x => {
        
      
           
            this.subject.limitedTime = true;
            //this.subject.time=12;
            this.questions = x;
            this.questions.forEach(
              question => {
                let questionStatus = new QuestionStatus();
                questionStatus.id = question.id;
                this.questionStatuses.push(questionStatus);
              }
            );

            this.subject.time = JSON.parse(this.cookie.get("time")).time;
            this.timer(this.subject.time);
          
        });
      }
      else {
        this.router.navigate(['/']);
      }

    }
    else {
      if (JSON.parse(this.cookie.get('user')).role == 1) {
        this.router.navigate(['/creating/teacher_panel']);
      }

      else {
        if (this.cookie.get('idSubject') == "") {

          this.router.navigate(['/quiz/student_panel']);
        }
        else {
          
          let markNumber:string=JSON.parse(this.cookie.get("markTable"))+'';
          this.markNumber=markNumber.split(",").map(Number);
          
          this.idSubject = this.cookie.get('idSubject');
          this.subjectObj = JSON.parse(this.cookie.get("subj"));
          this.idUser = (JSON.parse(this.cookie.get('user')).id);

          if (this.subjectObj.randomize) {
            this.testService.getRandQuestionsByIdSubject(this.idSubject).subscribe(x => {
              

                this.questions = x;

                this.questions.forEach(
                  question => {
                    let questionStatus = new QuestionStatus();
                    questionStatus.id = question.id;
                    this.questionStatuses.push(questionStatus);
                  }
                );

              
            });
          }
          else {
            this.testService.getQuestionsByIdSubjectWOStatus(this.idSubject).subscribe(x => {
          
                this.questions = x;

                this.questions.forEach(
                  question => {
                    let questionStatus = new QuestionStatus();
                    questionStatus.id = question.id;
                    this.questionStatuses.push(questionStatus);
                  }
                );

              
            });

          }



          this.subject.limitedTime = JSON.parse(this.cookie.get("time")).limitedTime;
          this.subject.time = JSON.parse(this.cookie.get("time")).time;
          if (this.subject.limitedTime == true) {
            this.timer(this.subject.time);
          }
        }
      }
    }
  }

  nextQuestion() {
    window.scroll(0,window.innerHeight*3/4);
    if (this.questionIndex < this.questions.length - 1) { this.questionIndex++; }
    else {
      this.lastQuestion = true;
    }
  }
  prevQuestion() {
    window.scroll(0,window.innerHeight/2);
    if (this.questionIndex > 0) {
      this.questionIndex--;
      this.firstQuestion = false;
    }
    else {
      this.firstQuestion = true;
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

  onSubmit() {
    this.isSubmitted = true;
    clearInterval()
  //  if (window.location.href.split('/')[4] == 'demo' || window.location.href.split('/')[5] == 'demo') {
      if (window.location.href.split('/').includes('demo')){
      this.testService.checkAnswersForDemo(this.questionStatuses).subscribe(
        x => {
          this.testService.setResult(x);
          this.testService.setQuestionsInResult(this.questionStatuses);
          this.router.navigate(['../end'], { relativeTo: this.route });
        }
      )
    }
    else {
      this.testService.checkAnswers(this.questionStatuses).subscribe(x => {
        this.testService.setQuestionsInResult(this.questionStatuses);
        this.testService.setResult(x);
        this.router.navigate(['../end'], { relativeTo: this.route });
      },
      e=>console.log(e));
    }
  }

  public timer(time) {
    this.actualTime = new Date().getTime();
    let endTime = this.actualTime + time * 60 * 1000;
    let x = setInterval(() => {

      let timeleft = Math.floor(endTime - (new Date().getTime()));
      if (timeleft <= 0) {
        if (!this.isSubmitted) this.onSubmit();
        clearInterval(x);
        return;
      }
      let hoursN = Math.floor(timeleft / (1000 * 60 * 60));
      let minutesN = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      let secundesN = Math.floor((timeleft % (1000 * 60)) / (1000));

      let hours = String(hoursN);
      let minutes = String(minutesN);
      let secundes = String(secundesN);

      if (hoursN < 10) hours = "0" + String(hoursN);
      if (minutesN < 10) minutes = "0" + String(minutesN);
      if (secundesN < 10) secundes = "0" + String(secundesN);

      this.timeLeft = hours + ":" + minutes + ":" + secundes;
    }, 1000);

  }

}

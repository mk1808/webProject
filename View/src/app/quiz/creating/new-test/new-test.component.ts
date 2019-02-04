import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subject, Cours, User } from '../../shared/models/classes';
import { DictionaryService } from '../../shared/services/dictionary.service';
import { CreatingService } from '../../shared/services/creating.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute } from '@angular/router';
import { TestService } from '../../shared/services/test.service';
import {AuthService} from "../../shared/services/auth.service";
import * as jwt_decode from "jwt-decode";


@Component({
  selector: 'app-new-test',
  templateUrl: './new-test.component.html',
  styleUrls: ['./new-test.component.css']
})
export class NewTestComponent implements OnInit {
  limitedTime: boolean = false;
  coursesTable: Cours[] = [];
  multipleChoiceTable: string[] = ['jednokrotny', 'wielokrotny']
  user: User;
  newTest: boolean;
  idExistingTest: number;
  initialized: boolean = false;
  newTestForm: FormGroup;
  testName: string = "";
  newUser:boolean = false;

  constructor(private fb: FormBuilder, private dictionary: DictionaryService,
    private creating: CreatingService, private cookie: CookieService,
    private router: Router, private route: ActivatedRoute, private test: TestService,
    private auth: AuthService) {
    this.route.params.subscribe(x => {
      let id = x['id'];
      if (id != undefined) { this.newTest = false; this.idExistingTest = id; } else { this.newTest = true; }
    });  }


  ngOnInit() {
    if (this.cookie.get('user') == "") {
      this.router.navigate(['/']);
    }
    else {
      if (JSON.parse(this.cookie.get('user')).role == 2) {
        this.router.navigate(['/quiz/student_panel']);
      }

      else {


        this.dictionary.getCourses().subscribe(x => {
          this.coursesTable = x;
          console.log(x);
        });
        this.user = (JSON.parse(this.cookie.get('user')));

        if (this.newTest) { // TUTAJ
          this.newTestForm = this.fb.group({
            name: ['', Validators.required],
            nOQuestions: ['', Validators.required],
            limitedTime: [false],
            multipleChoice: ['Krotność', Validators.required],
            time: [''],
            course: ['Kierunek studiów'],
            description: [''],
            separatedPages: [false],
            canBack: [''],
            randomize:[false],
            newUser:[false],
              email:[''],
              password:[''],
              passwordRepeat:['']

          },{validator: this.formValidator});
          this.initialized = true;
          this.newTestForm.controls.time.disable();
          this.newTestForm.controls.canBack.disable();

        }
        else {
          this.test.getQuizDetails(this.idExistingTest).subscribe(x => {
          
            
              this.testName = x.name;
              let hoursN = Math.floor(x.time / 60);
              let minutesN = x.time - hoursN * 60;

              let hours = String(hoursN);
              let minutes = String(minutesN);

              if (hoursN < 10) hours = "0" + String(hoursN);
              if (minutesN < 10) minutes = "0" + String(minutesN);

              this.newUser = !isNaN(Number(x.course));
              this.newTestForm = this.fb.group({
                name: [x.name, Validators.required],
                nOQuestions: [x.noQuestions, Validators.required],
                limitedTime: [x.limitedTime],
                multipleChoice: [{ value: (x.multipleChoice == 0 ? 'jednokrotny' : 'wielokrotny'), 
                disabled: true }, Validators.required],
                time: [hours + ":" + minutes],
                course: [x.course],
                description: [x.description],
                separatedPages: [x.separatePage ],
                canBack: [x.canBack],
                randomize: [x.randomize ],
                newUser:[this.newUser],
                email:[''],
                password:[''],
                passwordRepeat:['']
              });
              this.initialized = true;
              if(!x.separatePage)
              this.newTestForm.controls.canBack.disable(); 
            
          });
        }
      }
    }
  }

  formValidator(group: FormGroup){
    let correct = true;
    //group.clearValidators();



    //
    //
    //
    //
    //
    // Tutaj coś neie działa przzy edycji czasem
    //
    //
    //
    //

    if(group.controls.multipleChoice.value=="Krotność"){
      group.controls.multipleChoice.setErrors({'invalid':true});
    }
    
    if ( group.controls.newUser.value){
      if(group.controls.email.value==""){
        correct=false;
        group.controls.email.setErrors({'invalid':true});
      }
      if(group.controls.password.value==""){
        correct=false;
        group.controls.password.setErrors({'invalid':true});
      }
      if(group.controls.password.value!=group.controls.passwordRepeat.value){
        correct=false;
        group.controls.passwordRepeat.setErrors({'invalid':true});
      }
      group.controls.course.setErrors(null);
    }
    else {
      if(group.controls.course.value=="Kierunek studiów"){
        correct=false;
        group.controls.course.setErrors({'invalid':true});
      }
      group.controls.email.setErrors(null);
      group.controls.password.setErrors(null);
      group.controls.passwordRepeat.setErrors(null);
    }


    return correct? null:true;
  }

  onClickLimitedTime() {
    if (!this.newTestForm.controls.limitedTime.value) {
      this.newTestForm.controls.time.enable();
    }
    else { this.newTestForm.controls.time.disable(); }
  }

  onClickNewUser(){
    this.newUser = !this.newUser;
  }

  onClickSeparatedPages() {

    if (!this.newTestForm.controls.separatedPages.value) {
      this.newTestForm.controls.canBack.enable();
    }
    else {
      this.newTestForm.controls.canBack.disable();
      this.newTestForm.controls.canBack.setValue(false);
    }
  }

  

  onBack() {
    this.router.navigate(['/creating/teacher_panel']);
  }
  onCreate() {
    if (this.newTestForm.valid) {
      let subject = new Subject();
      subject.idAuthor = this.user.id;
      subject.description = this.newTestForm.controls.description.value;
      subject.name = this.newTestForm.controls.name.value;
      subject.limitedTime = this.newTestForm.controls.limitedTime.value;
      subject.noQuestions = this.newTestForm.controls.nOQuestions.value;
      subject.separatePage = this.newTestForm.controls.separatedPages.value;
      subject.canBack = this.newTestForm.controls.canBack.value;
      subject.randomize = this.newTestForm.controls.randomize.value;


      if (this.newTestForm.controls.limitedTime) {
        subject.time = (this.newTestForm.controls.time.value.split(":")[0]) * 60
          + this.newTestForm.controls.time.value.split(":")[1] * 1;
      }

      if (this.newTestForm.controls.multipleChoice.value == "jednokrotny") {
        subject.multipleChoice = false;
      }
      else {
        subject.multipleChoice = true;
      }
      this.cookie.set("multiple", subject.multipleChoice.toString(),null, "/");

      if(this.newTestForm.controls.newUser.value){
        let user:User = new User();
        user.email = this.newTestForm.controls.email.value+'@prz.pl';
        user.password = this.newTestForm.controls.password.value;
        user.c_password = this.newTestForm.controls.passwordRepeat.value;
        user.name="Użytkownik";
        user.surname = "Tymczasowy";
        user.course ="d";  
        this.auth.register(user).subscribe(userID=>{
          user.id = userID.user.id
          subject.course=userID.user.id;
          if (this.newTest) {
            this.creating.createSubject(subject).subscribe(x => {
              
                subject.id = x.id;
                this.cookie.set("subject",JSON.stringify(subject),null,'/');
             
                this.cookie.set("idSubject", x.id.toString(),null, "/");

                if(this.newTestForm.controls.newUser.value){
                  
                  this.auth.logIn(user).subscribe(auth=>{
                    
                    let data  = auth.user
                    user.id=data.id;
                    user.course = data.id.toString()
                    user.role = data.role.toString(); 
                    user.email = this.newTestForm.controls.email.value;
                   
                    this.auth.updateUser(user, auth.token).subscribe(t=>{
                      this.router.navigate(['./new_question'], { relativeTo: this.route });}, e =>{ console.log(e);
                        this.auth.deleteUser(user.id)        
                      });

                    }, e =>{ console.log(e);
                      this.auth.deleteUser(user.id)        
                    });
                  }
                else {
                  this.router.navigate(['./new_question'], { relativeTo: this.route });
                }
              //}
            }, e =>{ console.log(e);
              this.auth.deleteUser(user.id)        
            });
          } else {
            subject.id = this.idExistingTest;
            try {
              this.creating.updateSubject(subject).subscribe(x => {
              
                
                  if(this.newTestForm.controls.newUser.value){
                    this.auth.logIn(user).subscribe(auth=>{
                      
                      let data  = auth.user
                      user.id=data.id;
                      user.course = data.id.toString()
                      user.role = data.role.toString();
                      user.email = this.newTestForm.controls.email.value;
                   
                      this.auth.updateUser(user, auth.token).subscribe(t=>{
                        this.router.navigate(['./new_question'], { relativeTo: this.route });}, e =>{ console.log(e);
                          this.auth.deleteUser(user.id)        
                        });
  
                      }, e =>{ console.log(e);
                        this.auth.deleteUser(user.id)        
                      });
                    }
                  else {
                    this.router.navigate(['./new_question'], { relativeTo: this.route });
                  }
              
              }, e =>{ console.log(e);
                this.auth.deleteUser(user.id)        
              });
            }
            catch (e) {
              console.log(e);
            }
          }

        });
      }
      else {
        subject.course = this.newTestForm.controls.course.value;

        if (this.newTest) {
          this.creating.createSubject(subject).subscribe(x => {
            
              subject.id = x.id;
              this.cookie.set("subject",JSON.stringify(subject),null,'/');
              this.cookie.set("idSubject", x.id.toString(),null, "/");
              this.router.navigate(['./new_question'], { relativeTo: this.route });
            
          }, e => console.log(e));
        } else {
          subject.id = this.idExistingTest;
          try {
            this.creating.updateSubject(subject).subscribe(x => {
            
              
                this.cookie.set("idSubject", this.idExistingTest.toString(),null, "/");
                this.router.navigate(['../new_question'], { relativeTo: this.route });
              
            }, e => console.log(e));
          }
          catch (e) {
            console.log(e);
          }
        }
      }

    }
    else {

      this.newTestForm.controls["name"].markAsTouched();
      this.newTestForm.controls["nOQuestions"].markAsTouched();
      this.newTestForm.controls["limitedTime"].markAsTouched();
      this.newTestForm.controls["multipleChoice"].markAsTouched();
      this.newTestForm.controls["course"].markAsTouched();
      this.newTestForm.controls["description"].markAsTouched();
      this.newTestForm.controls["separatedPages"].markAsTouched();
      this.newTestForm.controls["canBack"].markAsTouched();
      this.newTestForm.controls["randomize"].markAsTouched();
      this.newTestForm.controls["newUser"].markAsTouched();
      this.newTestForm.controls["email"].markAsTouched();
      this.newTestForm.controls["password"].markAsTouched();
      this.newTestForm.controls["passwordRepeat"].markAsTouched();   
    
    }
  }


}

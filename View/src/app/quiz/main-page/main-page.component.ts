import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

//import { ParallaxModule, ParallaxConfig } from 'ngx-parallax';
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  initialParalax=900;

  constructor( private cookie: CookieService,
    private router: Router, private route: ActivatedRoute) { }


    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.initialParalax=0.5*window.innerWidth;
    }

  ngOnInit() {
    if(this.cookie.get('user')=="") {

    }
    else {
      if (JSON.parse(this.cookie.get('user')).role==1)
      {
        this.router.navigate(['quiz/creating/teacher_panel']);}
      else {
        this.router.navigate(['/quiz/student_panel']);
      }
    }
  }
  
  onDemo(){
    this.router.navigate(['/quiz/demo/begin']);

  }

  onLog(){
    this.router.navigate(['/login']);

  }

  onReg(){
    this.router.navigate(['/register']);

  }
}

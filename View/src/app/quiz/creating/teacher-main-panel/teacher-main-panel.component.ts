import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../shared/services/auth.service';
import { Subject } from '../../shared/models/classes';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatingService } from '../../shared/services/creating.service';

@Component({
  selector: 'app-teacher-main-panel',
  templateUrl: './teacher-main-panel.component.html',
  styleUrls: ['./teacher-main-panel.component.css']
})
export class TeacherMainPanelComponent implements OnInit {
  questions: string[] = [];
  tests: Subject[] = [];
  idUser: string;
  constructor(private cookie: CookieService, private auth: AuthService,
    private creating: CreatingService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    window.scroll(0,0);
    if (this.cookie.get('user') == "") {
      this.router.navigate(['/']);
    }
    else {
      if (JSON.parse(this.cookie.get('user')).role == 2) {
        this.router.navigate(['/quiz/student_panel']);
      }

      else {
        this.idUser = JSON.parse(this.cookie.get('user')).id;
        this.creating.getTests(this.idUser).subscribe(x => {
       
            this.tests = x;
          
        })
      }
    }
  }

  onNew() {
    this.router.navigate(['../new_test'], { relativeTo: this.route });
  }
  onView(id: string) {
    this.cookie.set("idSubject", id.toString(),null, "/");
    this.router.navigate(['../new_test/resume'], { relativeTo: this.route });

  }
  onChange(id: string){
    this.router.navigate(['../new_test/' + id], { relativeTo: this.route });
  }
}

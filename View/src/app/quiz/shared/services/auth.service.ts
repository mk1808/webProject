import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/index';
import { Subject, User } from '../models/classes';
import { CookieService } from 'ngx-cookie-service';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private path: string = "http://localhost/web/web/api/controllers/";
  constructor(private http: HttpClient, private cookie: CookieService, private rest:RestService) { }
  public logIn(user: User): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<any>('/api/login',
      user, httpOptions);
  }
  public register(user: User): Observable<any> {
    // return this.http.post<any>(this.path +'auth/createUser.php', JSON.stringify(user),   {observe: 'response'});
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<any>('/api/register', user, httpOptions);
  }
  

  

  public updateUser(user, token): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' +token
      })
    };
    return this.http.put('/api/updateUser', user, httpOptions);
  }
  
}

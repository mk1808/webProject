import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Question, QuestionStatus, Result} from '../models/classes';
import {Observable} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private result = new Result();

  constructor(private http: HttpClient) { }

  public getQuestions(): Observable<Question[]> {
      return this.http.get<Question[]>('http://localhost/web/web/api/controllers/getQuestionsQndAnswers.php');
  }

  public checkAnswers(questions: QuestionStatus[]): Observable<any> {
    return  this.http.post<Result>('http://localhost:80/web/web/api/controllers/checkAnswers.php', JSON.stringify({'questions': questions}));
  }

  public setResult(result: Result) {
    this.result = result;
  }

  public getResult(): Result {
    return this.result;
  }

}
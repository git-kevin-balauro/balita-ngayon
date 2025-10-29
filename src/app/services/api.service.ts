import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewsModel } from '../models/news.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl: string = environment.api.url
  private readonly apiKey: string = environment.api.key

  constructor(private http: HttpClient) { }

  public getNews(): Observable<NewsModel> {
    return this.http.get<NewsModel>(`${this.apiUrl}?access_key=${this.apiKey}`).pipe(
      catchError((error) => {
        return throwError(() => error.error)
      })
    )
  }
}

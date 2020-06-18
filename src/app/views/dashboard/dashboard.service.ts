import { Injectable } from '@angular/core';

import { Dates } from './dates.model';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  baseUrl = 'https://idleness-dashboard-api.herokuapp.com/dates';

  constructor(private http: HttpClient) { }

  read(): Observable<Dates[]> {
    return this.http.get<Dates[]>(this.baseUrl).pipe(
      map((obj) => obj),
      catchError((e) => this.errorHandler(e))
    );
  }

  errorHandler(e: any): Observable<any> {
    console.log(e);
    return;
  }
}

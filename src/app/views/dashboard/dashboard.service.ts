import { Injectable } from '@angular/core';

import { Dates } from './dates.model';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import * as moment from 'moment';
import 'moment-duration-format';
import { Task } from './task.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'https://idleness-dashboard-api.herokuapp.com/dates';
  private sumMinutes = 0;
  private sumDays = 0;
  private tasks: Task[] = [];
  arrayHours = [];

  constructor(private http: HttpClient) { }

  private formatTime(time): string {
    return moment.duration(time, 'minutes').format('h[ h] m[ min]', { trim: 'all' });
  }

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
  totalHours(array): string {
    this.sumMinutes = 0;
    array.forEach((time) => {
      this.sumMinutes += time.timeSpent;
    });
    return moment.duration(this.sumMinutes, 'minutes').format('h:mm[h]');
  }

  averageHours(): string {
    return moment.duration(moment.duration(this.sumMinutes, 'minutes').asHours() / this.sumDays, 'hours').format('h:mm[h]');
  }
  totalDays(array): string {
    let tempDate: string;
    this.sumDays = 0;
    array.forEach((date) => {
      if (date.date !== tempDate) {
        tempDate = date.date;
        this.sumDays++;
      }
    });
    return moment.duration(this.sumDays, 'days').locale('pt-BR').humanize();
  }

  totalWastedHours(): string {
    let tempHours: number;
    tempHours = moment.duration(this.sumDays * 8, 'hours').asMinutes() - this.sumMinutes;
    this.arrayHours.push(Math.round(moment.duration(this.sumMinutes, 'minutes').asHours()), Math.round(moment.duration(tempHours, 'minutes').asHours()));

    return moment.duration(tempHours, 'minutes').format('h:mm[h]');
  }

  taskList(array): Task[] {
    this.tasks = [];
    array.forEach((element) => {
      if (this.tasks.some((e) => e.name === element.task)) {
        this.tasks.find((item) => item.name === element.task).recurrence++;
        this.tasks.find((item) => item.name === element.task).totalTime += element.timeSpent;
        this.tasks.find((item) => item.name === element.task).totalTimeFormatted = this.formatTime(this.tasks.find((item) => item.name === element.task).totalTime);
      } else {
        this.tasks.push({
          name: element.task,
          recurrence: 1,
          totalTime: element.timeSpent,
          totalTimeFormatted: this.formatTime(element.timeSpent)
        });
      }
    });
    return this.tasks;
  }
}

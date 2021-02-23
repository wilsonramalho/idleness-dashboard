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

  dynamicColors(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }
  totalHours(array): string {
    this.sumMinutes = 0;
    array.forEach((time) => {
      if (time.task !== 'Nenhuma atividade') {
        this.sumMinutes += time.timeSpent;
      }
    });
    return moment.duration(this.sumMinutes, 'minutes').format('h:mm[h]');
  }

  averageHours(): string {
    console.log(Math.round(moment.duration(this.sumMinutes, 'minutes').asHours() / this.sumDays));
    return moment.duration(moment.duration(this.sumMinutes, 'minutes').asHours() / this.sumDays, 'hours').locale('pt-BR').humanize();
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
    this.arrayHours = [];
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

  private compare(a, b) {
    return a - b;
  }

  taskByDay(array): any {
    const tempArray = {
      data: [],
      labels: []
    };
    let tempDate = '';
    let tempCount = 0;
    array.forEach((data) => {
      if (data.date !== tempDate) {
        tempArray.labels.push(moment(data.date).format('D/M'));
        tempDate = data.date;
        if (data.task === 'Nenhuma atividade') {
          tempCount = 0;
        } else {
          tempCount = 1;
        }
        tempArray.data.push(tempCount);
      } else {
        tempCount++;
        tempArray.data.pop();
        tempArray.data.push(tempCount);
      }
    });
    return tempArray;
  }
}

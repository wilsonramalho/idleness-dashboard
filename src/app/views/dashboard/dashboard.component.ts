import { SharedService } from './../../shared.service';
import { BottonSheetFormComponent } from './../botton-sheet-form/botton-sheet-form.component';
import { Component, OnInit, ViewChild } from '@angular/core';

import { DashboardService } from './dashboard.service';
import { Dates } from './dates.model';
import { Task } from './task.model';

import * as moment from 'moment';
import 'moment-duration-format';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dates: Dates[];
  tasks: Task[] = [];
  hoursView: string;
  daysView: string;
  wastedHoursView: string;
  sumMinutes: number = 0;
  sumDays: number = 0;
  displayedColumns = ['recurrence', 'name', 'totalTimeFormatted'];
  eventSubscription: Subscription;
  dataSource: any;
  doughnutChartLabels: Array<string> = [];
  doughnutChartData: Array<number> = [];
  doughnutChartType = 'doughnut';
  doughnutChartOptions = {
    legend: {
      position: 'left'
    }
  };
  doughnutChartColors = [{
    backgroundColor: []
  }];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private dashboardService: DashboardService,
    private bottomSheet: MatBottomSheet,
    private sharedService: SharedService
  ) {
    this.eventSubscription = this.sharedService.receiveEvent().subscribe(() => {
      this._loadData();
      this.bottomSheet.dismiss();
    });
  }

  openBottonSheet(): void {
    this.bottomSheet.open(BottonSheetFormComponent);
  }

  _totalHours(array): void {
    array.forEach((time) => {
      this.sumMinutes += time.timeSpent;
    });
    this.hoursView = moment.duration(this.sumMinutes, 'minutes').format('h:mm[h]');
  }

  _totalDays(array): void {
    let tempDate: string;
    array.forEach((date) => {
      if (date.date !== tempDate) {
        tempDate = date.date;
        this.sumDays++;
      }
      this.daysView = this.sumDays + ' dias';
    });
  }

  _totalWastedHours(): void {
    let tempHours: number;
    tempHours =
      moment.duration(this.sumDays * 8, 'hours').asMinutes() - this.sumMinutes;
    this.wastedHoursView = moment.duration(tempHours, 'minutes').format('h:mm[h]');
  }

  _formatTime(time): string {
    return moment.duration(time, 'minutes').format('h[ h] [e ]m[ min]', { trim: 'all' });
  }

  _taskList(array): void {
    array.forEach((element) => {
      if (this.tasks.some((e) => e.name === element.task)) {
        this.tasks.find((item) => item.name === element.task).recurrence++;
        this.tasks.find((item) => item.name === element.task).totalTime += element.timeSpent;
        this.tasks.find((item) => item.name === element.task).totalTimeFormatted = this._formatTime(this.tasks.find((item) => item.name === element.task).totalTime);
      } else {
        this.tasks.push({
          name: element.task,
          recurrence: 1,
          totalTime: element.timeSpent,
          totalTimeFormatted: this._formatTime(element.timeSpent)
        });
      }
    });
    this.dataSource = new MatTableDataSource(this.tasks);
    this.dataSource.sort = this.sort;
    this.dataSource.sort.sort({ id: 'recurrence', start: 'desc', disableClear: false });
    this.dataSource.paginator = this.paginator;
  }

  _loadData(): void {
    this.sumDays = 0;
    this.sumMinutes = 0;
    this.dashboardService.read().subscribe((dates) => {
    this.dates = dates;
    this._taskList(this.dates);
    this._totalDays(this.dates);
    this._totalHours(this.dates);
    this._totalWastedHours();
    this._createDashboardData();
    });
  }

  _dynamicColors():string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  _createDashboardData(): void {
    this.tasks.forEach((task) => {
      this.doughnutChartLabels.push(task.name);
      this.doughnutChartData.push(task.recurrence);
      this.doughnutChartColors[0].backgroundColor.push(this._dynamicColors());
    });
    console.log(this.doughnutChartOptions);
  }

  ngOnInit(): void {
    this._loadData();
    this.paginator._intl.itemsPerPageLabel = 'Itens por página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.nextPageLabel = 'Próxima página';
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) { return `0 de ${length}`; }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };
  }
}

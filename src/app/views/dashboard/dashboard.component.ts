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
  displayedColumns = ['recurrence', 'name', 'totalTime'];
  eventSubscription: Subscription;
  dataSource: any;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private dashboardService: DashboardService,
    private bottomSheet: MatBottomSheet,
    private sharedService: SharedService
  ) {
    this.eventSubscription = this.sharedService.receiveEvent().subscribe(() => {
      this.loadData();
      this.bottomSheet.dismiss();
    });
  }

  openBottonSheet(): void {
    this.bottomSheet.open(BottonSheetFormComponent);
  }

  totalHours(array): void {
    array.forEach((time) => {
      this.sumMinutes += time.timeSpent;
    });
    this.hoursView = moment.duration(this.sumMinutes, 'minutes').format('h:mm[h]');
  }

  totalDays(array): void {
    let tempDate: string;
    array.forEach((date) => {
      if (date.date !== tempDate) {
        tempDate = date.date;
        this.sumDays++;
      }
      this.daysView = this.sumDays + ' dias';
    });
  }

  totalWastedHours(): void {
    let tempHours: number;
    tempHours =
      moment.duration(this.sumDays * 8, 'hours').asMinutes() - this.sumMinutes;
    this.wastedHoursView = moment.duration(tempHours, 'minutes').format('h:mm[h]');
  }

  taskList(array): void {
    array.forEach((element) => {
      if (this.tasks.some((e) => e.name === element.task)) {
        this.tasks.find((item) => item.name === element.task).recurrence++;
        this.tasks.find((item) => item.name === element.task).totalTime += element.timeSpent;
      } else {
        this.tasks.push({
          name: element.task,
          recurrence: 1,
          totalTime: element.timeSpent,
        });
      }
    });

    this.tasks.forEach((task) => {
      task.totalTime = moment.duration(task.totalTime, 'minutes').format('h[ h], m[ min]', { trim: 'all' });
    });
    this.dataSource = new MatTableDataSource(this.tasks);
    this.dataSource.sort = this.sort;
    this.dataSource.sort.sort({ id: 'recurrence', start: 'desc', disableClear: false });
    this.dataSource.paginator = this.paginator;
  }

  loadData(): void {
    this.sumDays = 0;
    this.sumMinutes = 0;
    this.dashboardService.read().subscribe((dates) => {
    this.dates = dates;
    this.taskList(this.dates);
    this.totalDays(this.dates);
    this.totalHours(this.dates);
    this.totalWastedHours();
    });
  }

  ngOnInit(): void {
    this.loadData();
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

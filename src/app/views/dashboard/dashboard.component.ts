import { SharedService } from './../../shared.service';
import { Component, OnInit, ViewChild } from '@angular/core';

import { DashboardService } from './dashboard.service';
import { Dates } from './dates.model';
import { Task } from './task.model';

import 'moment-duration-format';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { ChartDataSets, RadialChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dates: Dates[];
  tasksView: Task[] = [];
  avgHoursView: string;
  hoursView: string;
  daysView: string;
  wastedHoursView: string;
  displayedColumns = ['recurrence', 'name', 'totalTimeFormatted'];
  eventSubscription: Subscription;
  dataSource: any;
  public radarChartOptions: RadialChartOptions = {
    responsive: true,
    legend: {
      position: 'right'
    }
  };
  public radarChartData: ChartDataSets[] = [{
    data: [],
    label: 'Recorrência'
  }];
  public radarChartLabels: Label[] = [];
  // public radarChartColors = [{
  //   backgroundColor: []
  // }];
  public radarChartType: ChartType = 'radar';

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
      this.sharedService.spin$.next(false);
    });
  }

  private prepareTable(): void {
    this.dataSource = new MatTableDataSource(this.tasksView);
    this.dataSource.sort = this.sort;
    this.dataSource.sort.sort({ id: 'recurrence', start: 'desc', disableClear: false });
    this.dataSource.paginator = this.paginator;
  }

  private loadData(): void {
    this.dashboardService.read().subscribe((dates) => {
    this.dates = dates;
    this.tasksView = this.dashboardService.taskList(this.dates);
    this.daysView = this.dashboardService.totalDays(this.dates);
    this.hoursView = this.dashboardService.totalHours(this.dates);
    this.avgHoursView = this.dashboardService.averageHours();
    this.wastedHoursView = this.dashboardService.totalWastedHours();
    this.createDashboardData();
    this.prepareTable();
    });
  }

  private dynamicColors(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }

  private createDashboardData(): void {
    this.radarChartData = [
      { data: [], label: 'Recorrência' }
    ];
    this.radarChartLabels = [];
    this.tasksView.forEach((task) => {
      this.radarChartLabels.push(task.name);
      this.radarChartData[0].data.push(task.recurrence);
      //this.radarChartColors[0].backgroundColor.push(this.dynamicColors());
    });
  }

  private translatePaginatorBr(): void {
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

  ngOnInit(): void {
    this.loadData();
    this.translatePaginatorBr();
  }
}

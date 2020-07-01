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
import { ChartDataSets, ChartType, ChartOptions } from 'chart.js';
import { Label, SingleDataSet, Color } from 'ng2-charts';


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
  public genericChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false
    }
  };
  public radarChartData: ChartDataSets[] = [{
    data: [],
    label: 'Recorrência'
  }];
  public radarChartLabels: Label[] = [];
  public doughnutChartColors = [{
    backgroundColor: []
  }];
  public radarChartType: ChartType = 'radar';
  public doughnutChartData: SingleDataSet = [];
  public doughnutChartLabels: Label[] = ['Horas trabalhadas', 'Horas desperdiçadas'];
  public doughnutChartType: ChartType = 'doughnut';
  public lineChartData: ChartDataSets[] = [{
    data: [],
    label: 'Atividades'
  }];
  public lineChartLabels: Label[] = [];
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ]
  public lineChartType = 'line';

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
    this.createLineData(this.dates);
    this.createRadarData();
    this.createDoughtnutData();
    this.prepareTable();
    });
  }

  private createLineData(array): void {
    const chartData = this.dashboardService.taskByDay(array);
    this.lineChartData[0].data = chartData.data;
    this.lineChartLabels = chartData.labels;
  }

  private createDoughtnutData(): void {
    this.doughnutChartData = this.dashboardService.arrayHours;
    this.doughnutChartData.forEach(() => {
      this.doughnutChartColors[0].backgroundColor.push(this.dashboardService.dynamicColors());
    });
  }

  private createRadarData(): void {
    this.radarChartData = [
      { data: [], label: 'Recorrência' }
    ];
    this.radarChartLabels = [];
    this.tasksView.forEach((task) => {
      this.radarChartLabels.push(task.name);
      this.radarChartData[0].data.push(task.recurrence);
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
    console.log(this.lineChartLabels.length);
    this.loadData();
    this.translatePaginatorBr();
  }
}

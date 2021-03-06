import { SharedService } from './../../shared.service';
import { BottonSheetFormService } from './botton-sheet-form.service';
import { Dates } from './../dashboard/dates.model';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import * as moment from 'moment';
import 'moment-duration-format';

const VALUES = [
  {value: 'Análise', viewValue: 'Análise'},
  {value: 'Call', viewValue: 'Call'},
  {value: 'Call (Sem nenhuma participação)', viewValue: 'Call (Sem nenhuma participação)'},
  {value: 'Envio de e-mail', viewValue: 'Envio de e-mail'},
  {value: 'Git', viewValue: 'Git'},
  {value: 'Nenhuma atividade', viewValue: 'Nenhuma atividade'},
  {value: 'Prints de tela', viewValue: 'Prints de tela'}
];

@Component({
  selector: 'app-botton-sheet-form',
  templateUrl: './botton-sheet-form.component.html',
  styleUrls: ['./botton-sheet-form.component.scss']
})

export class BottonSheetFormComponent implements OnInit {

  options = VALUES;
  date: Dates = {
    date: '',
    timeSpent: null,
    task: ''
  };
  today = new FormControl(new Date());
  sendingData: boolean = false;
  isAllDayIdle: boolean = false;
  tempTimeSpent = 0;

  constructor(private bottomSheetFormService: BottonSheetFormService, private sharedService: SharedService, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }

  ngOnInit(): void {
    this.date.timeSpent = Math.round(moment.duration(this.data.timeSpent, 'milliseconds').asMinutes());
    this.tempTimeSpent = this.date.timeSpent;
  }

  registerWork(): void {
    this.sharedService.spin$.next(true);
    this.sendingData = true;
    this.date.date = moment(this.today.value).format('YYYY-MM-DD');
    this.date.timeSpent = Number(this.date.timeSpent);
    this.bottomSheetFormService.create(this.date).subscribe(() => {
      this.bottomSheetFormService.showMessage('Registro adicionado');
      this.sharedService.sendEvent();
    });
  }

  switchIdleness(): void {
    if (this.isAllDayIdle) {
      this.date.timeSpent = moment.duration(8, 'hours').asMinutes();
      this.date.task = VALUES[5].value;
    } else {
      this.date.timeSpent = this.tempTimeSpent;
      this.date.task = '';
    }
  }

}

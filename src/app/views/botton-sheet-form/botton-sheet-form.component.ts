import { SharedService } from './../../shared.service';
import { BottonSheetFormService } from './botton-sheet-form.service';
import { Dates } from './../dashboard/dates.model';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import * as moment from 'moment';

const VALUES = [
  {value: 'Análise', viewValue: 'Análise'},
  {value: 'Call', viewValue: 'Call'},
  {value: 'Call (Sem nenhuma participação)', viewValue: 'Call (Sem nenhuma participação)'},
  {value: 'Envio de e-mail', viewValue: 'Envio de e-mail'},
  {value: 'Git', viewValue: 'Git'},
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

  constructor(private bottomSheetFormService: BottonSheetFormService, private sharedService: SharedService) { }

  ngOnInit(): void {
  }

  registerWork(): void {
    this.date.date = moment(this.today.value).format('YYYY-MM-DD');
    this.date.timeSpent = Number(this.date.timeSpent);
    this.bottomSheetFormService.create(this.date).subscribe(() => {
      this.bottomSheetFormService.showMessage('Registro adicionado');
      this.sharedService.sendEvent();
    });
  }

}

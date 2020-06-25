import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
import 'moment-duration-format';

import { BottonSheetFormComponent } from './../../views/botton-sheet-form/botton-sheet-form.component';
import { SharedService } from './../../shared.service';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';

const ICON_IDLE = 'timer';
const ICON_RUNNING = 'timer_off';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss']
})
export class StopwatchComponent implements OnInit {

  _counter = 0;
  viewCounter: string;
  timerRef;
  isRunning = false;
  statusIcon = ICON_IDLE;
  eventSubscription: Subscription;

  go(): void {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.statusIcon = ICON_RUNNING;
      const start = Date.now() - (this._counter || 0);
      this.timerRef = setInterval(() => {
        this._counter = Date.now() - start;
        this.viewCounter = moment().hour(0).minute(0).second(0).milliseconds(this._counter).format('H:mm:ss');
      });
    } else {
      this.statusIcon = ICON_IDLE;
      clearInterval(this.timerRef);
      this.bottomSheet.open(BottonSheetFormComponent, { data: { timeSpent: this._counter }});
    }
  }

  _clear(): void {
    this.isRunning = false;
    this.statusIcon = ICON_IDLE;
    this._counter = 0;
    clearInterval(this.timerRef);
  }


  constructor(private bottomSheet: MatBottomSheet, private sharedService: SharedService) {
    this.eventSubscription = this.sharedService.receiveEvent().subscribe(() => {
      this._clear();
    });
  }



  ngOnInit(): void {
  }

}

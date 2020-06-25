import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject, Observable } from 'rxjs';
import { scan, map } from 'rxjs/operators';
import { MatSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private subject = new Subject<any>();
  private spinnerTopRef = this.cdkSpinnerCreate();

  spin$: Subject<boolean> = new Subject();

  constructor(private overlay: Overlay) {
    this.spin$.asObservable().pipe(map(val => val ? 1 : -1), scan((acc, one) => (acc + one) >= 0 ? acc + one : 0, 0)).subscribe((res) => {
      if(res === 1) {
        this.showSpinner();
      } else if (res === 0) {
        this.spinnerTopRef.hasAttached() ? this.stopSpinner() : null;
      }
    });
   }

  private cdkSpinnerCreate() {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });
  }

  private showSpinner() {
    this.spinnerTopRef.attach(new ComponentPortal(MatSpinner));
  }

  private stopSpinner() {
    this.spinnerTopRef.detach();
  }

  sendEvent() {
    this.subject.next();
  }

  receiveEvent(): Observable<any> {
    return this.subject.asObservable();
  }
}

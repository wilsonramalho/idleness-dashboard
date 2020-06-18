import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private subject = new Subject<any>();

  constructor() { }

  sendEvent() {
    this.subject.next();
  }

  receiveEvent(): Observable<any> {
    return this.subject.asObservable();
  }
}

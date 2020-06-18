import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottonSheetFormComponent } from './botton-sheet-form.component';

describe('BottonSheetFormComponent', () => {
  let component: BottonSheetFormComponent;
  let fixture: ComponentFixture<BottonSheetFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottonSheetFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottonSheetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

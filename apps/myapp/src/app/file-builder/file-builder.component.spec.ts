import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileBuilderComponent } from './file-builder.component';

describe('FileBuilderComponent', () => {
  let component: FileBuilderComponent;
  let fixture: ComponentFixture<FileBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

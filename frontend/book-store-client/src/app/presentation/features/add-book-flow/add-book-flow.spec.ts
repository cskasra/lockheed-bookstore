import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBookFlow } from './add-book-flow';

describe('AddBookFlow', () => {
  let component: AddBookFlow;
  let fixture: ComponentFixture<AddBookFlow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBookFlow],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBookFlow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

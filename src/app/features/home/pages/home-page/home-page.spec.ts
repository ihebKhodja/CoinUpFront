import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home-page';
import { CoinsListService } from '../../../../core/services/coinslist.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: CoinsListService,
          useValue: {
            getCoinsList: () =>
              of({
                totalItems: 0,
                page: 1,
                pageSize: 20,
                totalPages: 0,
                items: [],
              }),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

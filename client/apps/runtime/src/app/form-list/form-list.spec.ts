import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { PublishedFormRow } from '../form-schema.types';
import { FormList } from './form-list';

const API = 'http://localhost:3000/api/v1/schemas/published';

const mockForm: PublishedFormRow = {
  id: 'schema-1',
  title: 'Published Form',
  type: { name: 'form' },
};

describe('FormList', () => {
  let fixture: ComponentFixture<FormList>;
  let component: FormList;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormList],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormList);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches and displays only published forms from the discovery endpoint (AC-30)', () => {
    fixture.detectChanges();
    http.expectOne(API).flush([mockForm]);

    expect(component.forms()).toEqual([mockForm]);
    expect(component.isLoading()).toBe(false);
  });

  it('stops loading when the request fails', () => {
    fixture.detectChanges();
    http
      .expectOne(API)
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.isLoading()).toBe(false);
  });

  it("navigates to that form's viewer when opened", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    http.expectOne(API).flush([mockForm]);

    component.openForm(mockForm.id);

    expect(navigateSpy).toHaveBeenCalledWith(['form-viewer', mockForm.id], {
      relativeTo: expect.anything(),
    });
  });
});

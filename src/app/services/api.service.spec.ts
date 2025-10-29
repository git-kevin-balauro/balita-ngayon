import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { MOCK_NEWS } from '../testing/MOCK_NEWS';
import { asyncData } from '../testing/helper/asyncData';
import { MOCK_ERROR } from '../testing/MOCK_ERROR';
import { throwError } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NewsModel } from '../models/news.model';
import { environment } from '../../environments/environment';
import { MOCK_NEWS_EMPTY } from '../testing/MOCK_NEWS_EMPTY';

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ]
    });
    apiService = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(apiService).toBeTruthy();
  });
});

describe('ApiService (with spies)', () => {
  let apiService: ApiService
  let httpClientSpy: jasmine.SpyObj<HttpClient>

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get'])
    apiService = new ApiService(httpClientSpy)
  })

  it('should return expected news articles(HttpClient called once)', (done: DoneFn) => {
    const expectedNews = MOCK_NEWS

    httpClientSpy.get.and.returnValue(asyncData(expectedNews))

    apiService.getNews().subscribe({
      next: (news) => {
        expect(news).withContext('expected news').toEqual(expectedNews)
        done()
      },
      error: done.fail
    })
    expect(httpClientSpy.get.calls.count()).withContext('one call').toBe(1)
  })

  it('should return an error when the server returns a validation error', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse(MOCK_ERROR)

    httpClientSpy.get.and.returnValue(throwError(() => errorResponse))

    apiService.getNews().subscribe({
      next: (news) => done.fail('expected an error, not news'),
      error: (error) => {
        expect(error.message).toContain('Validation error')
        done()
      }
    })
  })
})

describe('ApiService (with mocks)', () => {
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let apiService: ApiService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })

    httpClient = TestBed.inject(HttpClient)
    httpTestingController = TestBed.inject(HttpTestingController)
    apiService = TestBed.inject(ApiService)
  })

  afterEach(() => {
    httpTestingController.verify()
  })

  describe('#getNews', () => {
    let expectedNews: NewsModel

    beforeEach(() => {
      apiService = TestBed.inject(ApiService)
      expectedNews = MOCK_NEWS as NewsModel
    })

    it('should return expected news (called once)', () => {
      const apiUrl = environment.api.url
      const apiKey = environment.api.key
      const url = `${apiUrl}?access_key=${apiKey}`

      apiService.getNews().subscribe({
        next: (news) => expect(news).withContext('should return expected news').toEqual(expectedNews),
        error: fail,
      })

      const req = httpTestingController.expectOne(url)
      expect(req.request.method).toEqual('GET')

      req.flush(expectedNews)
    })

    it('should be OK returning no articles', () => {
      const expectedNews = MOCK_NEWS_EMPTY
      const apiUrl = environment.api.url
      const apiKey = environment.api.key
      const url = `${apiUrl}?access_key=${apiKey}`

      apiService.getNews().subscribe({
        next: (news) => expect(news.data).withContext('should have empty heroes array').toEqual([]),
        error: fail
      })

      const req = httpTestingController.expectOne(url)
      req.flush(expectedNews)
    })

    it('should turn validation error into a user-friendly error', () => {
      const expectedError = MOCK_ERROR
      const apiUrl = environment.api.url
      const apiKey = environment.api.key
      const url = `${apiUrl}?access_key=${apiKey}`

      apiService.getNews().subscribe({
        next: (news) => fail('expected to fail'),
        error: (error) => expect(error.message).toContain("Validation error")
      })

      const req = httpTestingController.expectOne(url)
      req.flush(expectedError.error, { status: 400, statusText: 'Bad Request' })
    })
  })
})
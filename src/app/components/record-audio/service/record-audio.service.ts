import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecordAudioService {
  constructor(private httpClient: HttpClient) {}
}

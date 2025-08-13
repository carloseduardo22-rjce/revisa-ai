import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecordAudioService {
  constructor(private httpClient: HttpClient) {}

  async extractText(audio: Blob) {
    try {
      const formData = new FormData();
      formData.append('audio', audio);
      this.httpClient
        .post('http://localhost:3000/api/cards/transcribe-audio', formData)
        .subscribe({
          next: (response) => console.log('Resposta do backend:', response),
          error: (error) => console.error('Erro na requisição:', error),
        });
      console.log('Requisição foi feita');
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  }
}

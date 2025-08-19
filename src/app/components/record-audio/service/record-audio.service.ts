import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { ContentService } from '../../../services/content.service';

@Injectable({
  providedIn: 'root',
})
export class RecordAudioService {
  private recognition: any = null;
  private recording: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private contentService: ContentService,
    private ngZone: NgZone
  ) {}

  get isRecording(): boolean {
    return this.recording;
  }

  startRecording(maxAudios: number, onTranscriptionComplete: () => void): void {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR';

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          if (
            event.results[0].isFinal &&
            this.contentService.questionsAndAnswersSignal().length <= maxAudios
          ) {
            const transcription = event.results[0][0].transcript;
            this.saveUserAnswer(transcription);
            onTranscriptionComplete();
          }
        });
      };

      this.recognition.onaudioend = () => {
        this.ngZone.run(() => {
          this.recording = false;
        });
      };

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          this.recording = true;
        });
      };

      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition: ', error);
    }
  }

  stopRecording(): void {
    if (this.recognition && this.recording) {
      this.recognition.stop();
    }
  }

  private saveUserAnswer(transcription: string): void {
    const index = this.contentService.cardIndex();

    this.contentService.questionsAndAnswersSignal.update((prev) => {
      const updatedArray = [...prev];
      if (updatedArray[index]) {
        updatedArray[index] = {
          ...updatedArray[index],
          answerUser: transcription,
        };
      }
      return updatedArray;
    });
  }
}

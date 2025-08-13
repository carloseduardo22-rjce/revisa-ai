import { Component, ChangeDetectorRef } from '@angular/core';
import LucideIconData from '../../shared/icons/LucideIconData';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconNode } from 'lucide-angular';
import { RecordAudioService } from './service/record-audio.service';

@Component({
  selector: 'app-record-audio',
  imports: [LucideAngularModule],
  templateUrl: './record-audio.component.html',
})
export class RecordAudioComponent {
  constraints = {
    audio: true,
    video: false,
  };
  stream: MediaStream | null = null;
  recording: boolean = false;
  recordedChunks: Blob[] = [];
  mediaRecorder: MediaRecorder | null = null;
  audioUrl: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private recordAudioService: RecordAudioService
  ) {}

  getIconByName(name: string): readonly LucideIconNode[] | undefined {
    return LucideIconData.getIconByName(name);
  }

  async getMedia(constraints: any) {
    try {
      if (this.recording) {
        this.recording = false;
        this.mediaRecorder?.stop();
        this.stream?.getAudioTracks().forEach((track) => track.stop());
      } else {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          this.recordAudioService.extractText(blob);
        };

        this.mediaRecorder.start();
        this.recording = true;
      }
    } catch (err) {
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  }
}

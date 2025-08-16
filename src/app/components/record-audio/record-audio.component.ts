import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
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
  recognition: any = null;
  audio: string | null = null;
  recording: boolean = false;

  constructor(
    private recordAudioService: RecordAudioService,
    private ngZone: NgZone
  ) {}

  getIconByName(name: string): readonly LucideIconNode[] | undefined {
    return LucideIconData.getIconByName(name);
  }

  getAudio() {
    try {
      if (this.recording) {
        this.recognition.stop();
      } else {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'pt-BR';

        this.recognition.onresult = (event: any) => {
          this.ngZone.run(() => {
            this.audio = event.results[0][0].transcript;
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
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  }
}

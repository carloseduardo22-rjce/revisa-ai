import { Component, Input, Output, EventEmitter } from '@angular/core';
import LucideIconData from '../../shared/icons/LucideIconData';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconNode } from 'lucide-angular';
import { RecordAudioService } from './service/record-audio.service';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-record-audio',
  imports: [LucideAngularModule],
  templateUrl: './record-audio.component.html',
})
export class RecordAudioComponent {
  @Input() maxAudios: number | null = null;
  @Output() recordingEnd = new EventEmitter<boolean>(false);

  constructor(
    private recordAudioService: RecordAudioService,
    private contentService: ContentService
  ) {}

  get isRecording(): boolean {
    return this.recordAudioService.isRecording;
  }

  get audioCount(): number {
    return this.contentService
      .questionsAndAnswersSignal()
      .filter((qa) => qa.answerUser && qa.answerUser.trim() !== '').length;
  }

  getIconByName(name: string): readonly LucideIconNode[] | undefined {
    return LucideIconData.getIconByName(name);
  }

  toggleRecording(): void {
    if (this.isRecording) {
      this.recordAudioService.stopRecording();
    } else {
      if (this.maxAudios) {
        this.recordAudioService.startRecording(this.maxAudios, () =>
          this.recordingEnd.emit(true)
        );
      }
    }
  }
}

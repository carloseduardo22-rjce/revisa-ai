import { Component, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import LucideIconData from '../../shared/icons/LucideIconData';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconNode } from 'lucide-angular';
import { Content } from '../../models/content.interface';
import { ContentService } from '../../services/content.service';
import { RecordAudioComponent } from '../record-audio/record-audio.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-card-review',
  imports: [CommonModule, LucideAngularModule, RecordAudioComponent],
  templateUrl: './card-review.component.html',
  styleUrls: ['./card-review.component.css'],
})
export class CardReviewComponent {
  backOfCard = false;
  content: Content | null = null;
  recordingEnd: boolean = false;
  modalIntroduction: boolean = true;
  Math = Math;

  questionsAndAnswers = computed(() =>
    this.contentService.questionsAndAnswersSignal()
  );
  currentIndex = computed(() => this.contentService.cardIndex());

  constructor(
    private contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const content = this.contentService.reviewWithCard();
      if (content) {
        this.content = content;
        this.loadQuestionsAndAnswers();
      }
    });
  }

  showResults(): boolean {
    return this.questionsAndAnswers().every(
      (qa) => qa.answerUser && qa.answerUser.trim() !== ''
    );
  }

  async getFeedback() {
    const result = this.contentService.questionsAndAnswersSignal();
    const feedback = await this.contentService.getFeedback(result);
    console.log(feedback);
  }

  async loadQuestionsAndAnswers() {
    if (this.content?.link) {
      try {
        this.contentService.questionsAndAnswersSignal.set([]);

        const result = await this.contentService.questionsAndAnswers(
          this.content.link
        );
        let questionsAndAnswers = result.split('\n\n');
        questionsAndAnswers.forEach((qa) => {
          const cleanedQa = qa.replace(/\*/g, '');
          const [question, answer] = cleanedQa.split('?');
          if (question && answer) {
            this.contentService.questionsAndAnswersSignal.update((prev) => [
              ...prev,
              {
                question: question + '?',
                answer: answer.trim(),
              },
            ]);
          }
        });
      } catch (error) {
        console.error('Erro ao carregar perguntas e respostas:', error);
      }
    }
  }

  getIconByName(name: string): readonly LucideIconNode[] | undefined {
    return LucideIconData.getIconByName(name);
  }

  nextCard() {
    const currentIdx = this.contentService.cardIndex();
    const questionsLength = this.questionsAndAnswers();

    if (currentIdx < questionsLength.length - 1) {
      this.contentService.cardIndex.update((idx) => idx + 1);
      this.backOfCard = false;
      this.recordingEnd = false;
    }
  }

  prevCard() {
    const currentIdx = this.contentService.cardIndex();

    if (currentIdx > 0) {
      this.contentService.cardIndex.update((idx) => idx - 1);
      this.backOfCard = false;
      this.recordingEnd = false;
    }
  }
}

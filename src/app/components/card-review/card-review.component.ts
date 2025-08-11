import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import LucideIconData from '../../shared/icons/LucideIconData';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconNode } from 'lucide-angular';
import { Content } from '../../models/content.interface';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-card-review',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './card-review.component.html',
  styleUrls: ['./card-review.component.css'],
})
export class CardReviewComponent implements OnInit {
  backOfCard = false;
  content: Content | null = null;
  questionsAndAnswers: { question: string; answer: string }[] = [];
  currentIndex = 0;

  constructor(private contentService: ContentService) {
    effect(() => {
      const content = this.contentService.reviewWithCard();
      if (content) {
        this.content = content;
        this.loadQuestionsAndAnswers();
      }
    });
  }

  async ngOnInit() {
    if (this.content) {
      await this.loadQuestionsAndAnswers();
    }
  }

  async loadQuestionsAndAnswers() {
    if (this.content?.link) {
      try {
        const result = await this.contentService.questionsAndAnswers(
          this.content.link
        );
        let questionsAndAnswers = result.split('\n\n');
        questionsAndAnswers.forEach((qa) => {
          const cleanedQa = qa.replace(/\*/g, '');
          const [question, answer] = cleanedQa.split('?');
          if (question && answer) {
            this.questionsAndAnswers.push({
              question: question,
              answer: answer,
            });
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
    if (this.currentIndex < this.questionsAndAnswers.length - 1) {
      this.currentIndex++;
      this.backOfCard = false;
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.backOfCard = false;
    }
  }
}

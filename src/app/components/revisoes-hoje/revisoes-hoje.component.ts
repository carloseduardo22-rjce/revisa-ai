import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { Content } from '../../models/content.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-revisoes-hoje',
  standalone: true,
  templateUrl: './revisoes-hoje.component.html',
})
export class RevisoesHojeComponent implements OnInit {
  reviewsToday: Content[] = [];
  loading: boolean = false;

  get reviewStart() {
    return this.contentService.reviewStarted();
  }
  get stopWatch() {
    return this.contentService.stopWatch();
  }

  constructor(private contentService: ContentService, private router: Router) {}

  async ngOnInit() {
    await this.findReviewsToday();
  }

  startTimer(contentId: number): void {
    this.contentService.startTimer(contentId);
  }

  isTimerActive(contentId: number): boolean {
    return this.contentService.isTimerActive(contentId);
  }

  closeModal(): void {
    this.contentService.reviewStarted.set(false);
  }

  async findReviewsToday(): Promise<void> {
    this.loading = true;
    try {
      this.reviewsToday = await this.contentService.getTodayReviews();
    } catch (error) {
      console.error('Erro ao buscar revisões:', error);
      this.reviewsToday = [];
    } finally {
      this.loading = false;
    }
  }

  reviewWithCard(content: Content): void {
    this.contentService.reviewWithCard.set(content);
    this.router.navigate(['reviews/with-cards']);
  }

  async lastReview(content: Content): Promise<void> {
    this.loading = true;
    try {
      if (this.contentService.isTimerActive(content.id)) {
        this.contentService.stopTimer(content.id);
      }

      const result = await this.contentService.updateReview(content);

      if (result.success) {
        alert(
          `✅ ${result.message}\n📅 Próxima revisão: ${result.next_review}`
        );
        await this.findReviewsToday();
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar revisão:', error);
      alert('❌ Erro ao conectar com o servidor');
    } finally {
      this.loading = false;
    }
  }
}

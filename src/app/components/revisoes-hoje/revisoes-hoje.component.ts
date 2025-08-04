import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { Content } from '../../models/content.interface';

@Component({
  selector: 'app-revisoes-hoje',
  standalone: true,
  templateUrl: './revisoes-hoje.component.html',
})
export class RevisoesHojeComponent implements OnInit {
  reviewsToday: Content[] = [];
  loading = false;

  constructor(private contentService: ContentService) {}

  async ngOnInit() {
    await this.findReviewsToday();
  }

  async findReviewsToday() {
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
  }

  async lastReview(content: Content) {
    this.loading = true;
    try {
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

import { Component } from '@angular/core';
import { Content } from '../../models/content.interface';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-forgotten-reviews',
  imports: [],
  templateUrl: './forgotten-reviews.component.html',
})
export class ForgottenReviewsComponent {
  forgottenReviews: Content[] = [];

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.loadForgottenReviews();
  }

  async loadForgottenReviews() {
    this.forgottenReviews = await this.contentService.getForgottenReviews();
  }

  async lastReview(content: Content) {
    content.late = 'sim';
    try {
      const result = await this.contentService.updateReview(content);

      if (result.success) {
        alert(
          `✅ ${result.message}\n📅 Próxima revisão: ${result.next_review}`
        );
        this.loadForgottenReviews();
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar revisão:', error);
      alert('❌ Erro ao conectar com o servidor');
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { Content } from '../../models/content.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  reviewsToday: Content[] = [];
  forgottenReviews: Content[] = [];
  loading = false;

  constructor(private contentService: ContentService) {}

  async ngOnInit() {
    await this.findReviewsToday();
    await this.findForgottenReviews();
  }

  async findForgottenReviews() {
    this.forgottenReviews = await this.contentService.getForgottenReviews();
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
}

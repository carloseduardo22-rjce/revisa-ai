import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  reviewsToday: Array<{
    id: number;
    titulo: string;
    link: string;
    created_at: string;
    nextReview: string | null;
    ultima_revisao: number;
    data_ultima_revisao: string | null;
  }> = [];

  ngOnInit() {
    this.findReviewsToday();
  }

  async findReviewsToday() {
    try {
      const response = await fetch('http://localhost:3000/api/contents');
      const contents = await response.json();
      const today = new Date().toLocaleDateString('en-CA');

      this.reviewsToday = contents.filter((content: any) => {
        return content.nextReview === today && content.ultima_revisao < 4;
      });
    } catch (e) {
      this.reviewsToday = [];
    }
  }
}

import { Component, effect } from '@angular/core';
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
export class CardReviewComponent {
  backOfCard = false;
  content: Content | null = null;

  constructor(private contentService: ContentService) {
    effect(() => {
      const content = this.contentService.reviewWithCard();
      if (content) {
        this.content = content;
      }
    });
  }

  flipCard() {
    this.backOfCard = !this.backOfCard;
  }

  getIconByName(name: string): readonly LucideIconNode[] | undefined {
    return LucideIconData.getIconByName(name);
  }
}

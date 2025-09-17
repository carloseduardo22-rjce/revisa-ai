import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { AddContentComponent } from './components/add-content/add-content.component';
import { RevisoesHojeComponent } from './components/revisoes-hoje/revisoes-hoje.component';
import { ForgottenReviewsComponent } from './components/forgotten-reviews/forgotten-reviews.component';
import { CardReviewComponent } from './components/card-review/card-review.component';
import { RecordAudioComponent } from './components/record-audio/record-audio.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'contents/add',
        component: AddContentComponent,
        title: 'Conteúdos',
      },
      {
        path: 'reviews/today',
        component: RevisoesHojeComponent,
        title: 'Revisões para hoje',
      },
      {
        path: 'reviews/forget',
        component: ForgottenReviewsComponent,
        title: 'Revisões esquecidas',
      },
      {
        path: 'reviews/with-cards',
        component: CardReviewComponent,
        title: 'Revisões com cartões',
      },
      {
        path: 'audio',
        component: RecordAudioComponent,
        title: 'Gravação de Áudio',
      },
    ],
  },
];

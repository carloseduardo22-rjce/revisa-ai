import { Routes } from '@angular/router';
import { LayoutComponent } from '../app/components/layout/layout.component';
import { AddContentComponent } from '../app/components/add-content/add-content.component';
import { RevisoesHojeComponent } from '../app/components/revisoes-hoje/revisoes-hoje.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'contents/add', component: AddContentComponent },
      { path: 'revisoes', component: RevisoesHojeComponent },
    ],
  },
];

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
  revisoesHoje: Array<{
    id: number;
    titulo: string;
    link: string;
    created_at: string;
    proximaRevisao: string | null;
  }> = [];

  ngOnInit() {
    this.buscarRevisoesHoje();
  }

  async buscarRevisoesHoje() {
    try {
      const response = await fetch('http://localhost:3000/api/contents');
      const conteudos = await response.json();
      this.revisoesHoje = conteudos.filter((conteudo: any) => {
        const proximaRevisao: string = conteudo.proximaRevisao;
        const hoje = new Date().toISOString().split('T')[0];
        if (proximaRevisao === hoje.toString()) {
          return conteudo;
        }
      });
    } catch (e) {
      this.revisoesHoje = [];
    }
  }
}

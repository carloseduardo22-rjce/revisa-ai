import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-revisoes-hoje',
  standalone: true,
  templateUrl: './revisoes-hoje.component.html',
})
export class RevisoesHojeComponent implements OnInit {
  reviewsToday: Array<{
    id: number;
    titulo: string;
    link: string;
    created_at: string;
    proximaRevisao: string | null;
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
        return content.proximaRevisao === today && content.ultima_revisao < 4;
      });
    } catch (e) {
      this.reviewsToday = [];
    }
  }

  async lastReview(id: number) {
    try {
      const response = await fetch(`http://localhost:3000/api/contents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const message = await response.json();
      if (message.success) {
        alert(
          `✅ ${message.message}\n📅 Próxima revisão: ${message.proxima_revisao}`
        );
        this.findReviewsToday();
      } else {
        alert(`❌ Erro: ${message.error}`);
      }
    } catch (e) {
      console.error('Erro ao atualizar a revisão:', e);
      alert('❌ Erro ao conectar com o servidor');
    }
  }
}

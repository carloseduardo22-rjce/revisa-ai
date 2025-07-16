import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-content',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-content.component.html',
})
export class AddContentComponent implements OnInit {
  showForm = false;
  titulo = '';
  link = '';
  contents: Array<{
    id: number;
    titulo: string;
    link: string;
    created_at: string;
    proximaRevisao: string | null;
    resume_ai: string | null;
    ultima_revisao: number;
    data_ultima_revisao: string | null;
  }> = [];

  ngOnInit() {
    this.listContents();
  }

  async listContents() {
    try {
      const response = await fetch('http://localhost:3000/api/contents');
      this.contents = await response.json();
      console.log(this.contents);
    } catch (e) {
      this.contents = [];
    }
  }

  async addContent() {
    if (!this.titulo.trim() || !this.link.trim()) return;
    try {
      await fetch('http://localhost:3000/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: this.titulo,
          link: this.link,
        }),
      });
      this.titulo = '';
      this.link = '';
      this.showForm = false;
      this.listContents();
    } catch (e) {}
  }

  async deleteContent(id: number) {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;
    try {
      await fetch(`http://localhost:3000/api/contents/${id}`, {
        method: 'DELETE',
      });
      this.listContents();
    } catch (e) {}
  }
}

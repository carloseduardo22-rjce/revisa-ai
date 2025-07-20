import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../services/content.service';
import { Content } from '../../models/content.interface';

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
  loading = false;
  contents: Content[] = [];
  editingId: number | null = null;
  isEditing = false;

  constructor(private contentService: ContentService) {}

  async ngOnInit() {
    await this.loadContents();
  }

  async loadContents(): Promise<void> {
    this.loading = true;
    try {
      this.contents = await this.contentService.getAllContents();
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
      this.contents = [];
    } finally {
      this.loading = false;
    }
  }

  async addContent(): Promise<void> {
    if (!this.titulo.trim() || !this.link.trim()) return;

    this.loading = true;
    try {
      const result = await this.contentService.createContent({
        titulo: this.titulo,
        link: this.link,
      });

      if (result) {
        console.log(result);
      }

      this.titulo = '';
      this.link = '';
      this.showForm = false;

      await this.loadContents();
    } catch (error) {
      console.error('Erro ao adicionar conteúdo:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateContent(): Promise<void> {
    if (!this.titulo.trim() || !this.link.trim() || !this.editingId) return;

    this.loading = true;
    try {
      await this.contentService.updateContent(this.editingId, {
        titulo: this.titulo,
        link: this.link,
      });

      this.cancelEdit();
      await this.loadContents();
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
    } finally {
      this.loading = false;
    }
  }

  editContent(content: Content): void {
    this.editingId = content.id;
    this.titulo = content.titulo;
    this.link = content.link;
    this.isEditing = true;
    this.showForm = true;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.titulo = '';
    this.link = '';
    this.isEditing = false;
    this.showForm = false;
  }

  async deleteContent(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;

    this.loading = true;
    try {
      await this.contentService.deleteContent(id);
      await this.loadContents();
    } catch (error) {
      console.error('Erro ao deletar conteúdo:', error);
    } finally {
      this.loading = false;
    }
  }
}

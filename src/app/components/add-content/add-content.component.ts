import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContentService } from '../../services/content.service';
import { Content } from '../../models/content.interface';

@Component({
  selector: 'app-add-content',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-content.component.html',
})
export class AddContentComponent implements OnInit {
  contentForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    link: new FormControl('', [
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/),
    ]),
  });

  showForm = false;
  loading = false;
  contents: Content[] = [];
  editingId: number | null = null;
  isEditing = false;

  constructor(private contentService: ContentService) {}

  async ngOnInit() {
    await this.loadContents();
  }

  async loadContents() {
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

  async addContent() {
    if (this.contentForm.invalid) return;

    this.loading = true;
    try {
      const formValues = this.contentForm.value;

      await this.contentService.createContent({
        title: formValues.titulo!,
        link: formValues.link!,
      });

      this.contentForm.reset();
      this.showForm = false;

      await this.loadContents();
    } catch (error) {
      console.error('Erro ao adicionar conteúdo:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateContent() {
    if (this.contentForm.invalid || !this.editingId) return;

    this.loading = true;
    try {
      const formValues = this.contentForm.value;
      await this.contentService.updateContent(this.editingId, {
        title: formValues.titulo!,
        link: formValues.link!,
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
    this.contentForm.patchValue({
      titulo: content.titulo,
      link: content.link,
    });
    this.isEditing = true;
    this.showForm = true;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.contentForm.reset();
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

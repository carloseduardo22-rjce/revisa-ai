import { Injectable, signal } from '@angular/core';
import {
  Content,
  CreateContentRequest,
  UpdateContentRequest,
} from '../models/content.interface';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly API_BASE = 'http://localhost:3000/api';
  private readonly CACHE_KEY = 'contents';

  reviewWithCard = signal<Content | null>(null);
  reviewStarted = signal<boolean>(false);
  stopWatch = signal<string>('00:00');

  private timers: { [contentId: number]: boolean } = {};
  private activeIntervals: { [contentId: number]: number } = {};
  private readonly TIMER_LIMIT_MINUTES = 40;

  async getAllContents(useCache = true): Promise<Content[]> {
    if (useCache) {
      const cached = this.getFromCache();
      if (cached) {
        setTimeout(() => this.refreshCache(), 100);
        return cached;
      }
    }

    return await this.fetchFromServer();
  }

  async createContent(request: CreateContentRequest): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/contents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.clearCache();
      return result;
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      throw error;
    }
  }

  async questionsAndAnswers(link: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.API_BASE}/questions/${encodeURIComponent(link)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao buscar perguntas e respostas:', error);
      return '';
    }
  }

  async deleteContent(id: number): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/contents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.clearCache();
      return result;
    } catch (error) {
      console.error('Erro ao deletar conteúdo:', error);
      throw error;
    }
  }

  async updateContent(id: number, request: UpdateContentRequest): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/contents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.clearCache();
      return;
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      throw error;
    }
  }

  async updateReview(content: Content): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/contents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.clearCache();
      return result;
    } catch (error) {
      console.error('Erro ao atualizar revisão:', error);
      throw error;
    }
  }

  async getTodayReviews(): Promise<Content[]> {
    try {
      const contents = await this.getAllContents();
      const today = new Date().toISOString().split('T')[0];

      return contents.filter(
        (content) => content.nextReview === today && content.ultima_revisao < 4
      );
    } catch (error) {
      console.error('Erro ao buscar revisões de hoje:', error);
      return [];
    }
  }

  async getForgottenReviews(): Promise<Content[]> {
    try {
      const contents = await this.getAllContents();
      console.log(contents);
      return contents.filter((content) => this.isPastTheReviewDate(content));
    } catch (error) {
      console.error('Erro ao buscar revisões esquecidas:', error);
      return [];
    }
  }

  startTimer(contentId: number): void {
    this.reviewStarted.set(true);
    this.timers[contentId] = true;

    let minutes = 0;
    let seconds = 0;

    const intervalId = window.setInterval(() => {
      seconds++;
      if (seconds === 60) {
        minutes++;
        seconds = 0;
      }

      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;

      this.stopWatch.set(formattedTime);

      if (minutes >= this.TIMER_LIMIT_MINUTES) {
        this.stopTimer(contentId);
        this.autoCompleteReview(contentId);
      }
    }, 1000);

    this.activeIntervals[contentId] = intervalId;
  }

  stopTimer(contentId: number): void {
    try {
      if (this.activeIntervals[contentId]) {
        window.clearInterval(this.activeIntervals[contentId]);
        delete this.activeIntervals[contentId];
      }
      this.timers[contentId] = false;
      this.reviewStarted.set(false);
      this.stopWatch.set('00:00');
    } catch (error) {
      console.error('Erro ao parar timer:', error);
    }
  }

  isTimerActive(contentId: number): boolean {
    return this.timers[contentId] || false;
  }

  private async autoCompleteReview(contentId: number): Promise<void> {
    const contents = await this.getAllContents();
    const content = contents.find((c) => c.id === contentId);

    if (content) {
      try {
        await this.updateReview(content);
        console.log(`Revisão auto-completada para: ${content.titulo}`);
      } catch (error) {
        console.error('Erro ao auto-completar revisão:', error);
      }
    }
  }

  private isPastTheReviewDate(content: Content): boolean {
    try {
      if (
        content.ultima_revisao >= 4 ||
        new Date(content.nextReview ?? '') > new Date()
      ) {
        return false;
      }

      type ReviewLevel = 1 | 2 | 3;
      const reviewSchedule: Record<ReviewLevel, number> = {
        1: 7,
        2: 7,
        3: 14,
      };

      const daysPassed = new Date(content.created_at);
      daysPassed.setDate(
        daysPassed.getDate() +
          reviewSchedule[content.ultima_revisao as ReviewLevel]
      );
      const today = new Date();

      if (today > daysPassed) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar data de revisão:', error);
      return false;
    }
  }

  private getFromCache(): Content[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private saveToCache(contents: Content[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(contents));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  private clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  private async refreshCache(): Promise<void> {
    try {
      await this.fetchFromServer();
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }

  private async fetchFromServer(): Promise<Content[]> {
    try {
      const response = await fetch(`${this.API_BASE}/contents`);
      const contents = await response.json();

      this.saveToCache(contents);
      return contents;
    } catch (error) {
      const cached = this.getFromCache();
      if (cached) return cached;
      throw error;
    }
  }
}

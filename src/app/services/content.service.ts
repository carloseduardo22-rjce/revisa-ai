import { Injectable } from '@angular/core';
import { Content, CreateContentRequest } from '../models/content.interface';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly API_BASE = 'http://localhost:3000/api';
  private readonly CACHE_KEY = 'contents';

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
    const response = await fetch(`${this.API_BASE}/contents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    this.clearCache();
    return result;
  }

  async deleteContent(id: number): Promise<any> {
    const response = await fetch(`${this.API_BASE}/contents/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    this.clearCache();
    return result;
  }

  async updateReview(id: number): Promise<any> {
    const response = await fetch(`${this.API_BASE}/contents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    this.clearCache();
    return result;
  }

  async getTodayReviews(): Promise<Content[]> {
    const contents = await this.getAllContents();
    const today = new Date().toISOString().split('T')[0];

    return contents.filter(
      (content) => content.nextReview === today && content.ultima_revisao < 4
    );
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

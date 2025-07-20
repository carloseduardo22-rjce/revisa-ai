export interface Content {
  id: number;
  titulo: string;
  link: string;
  created_at: string;
  nextReview: string | null;
  resume_ai: string | null;
  ultima_revisao: number;
  data_ultima_revisao: string | null;
}

export interface CreateContentRequest {
  titulo: string;
  link: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

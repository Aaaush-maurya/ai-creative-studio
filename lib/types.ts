export interface User {
  id: string;
  email?: string;
}

export interface Generation {
  id: string;
  user_id: string;
  original_prompt: string;
  enhanced_prompt: string | null;
  image_url: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  message?: string;
}



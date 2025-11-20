export interface PresetCommand {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  description: string;
}

export interface EditorState {
  originalImage: string | null; // Data URL
  processedImage: string | null; // Data URL
  isProcessing: boolean;
  error: string | null;
  currentPrompt: string;
}

export enum ImageMimeType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp'
}
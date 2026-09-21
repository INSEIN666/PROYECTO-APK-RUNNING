export interface ImagePickerResult {
  uri: string | null;
  loading: boolean;
  error: string | null;
  pickFromGallery: () => Promise<void>;
  takePhoto: () => Promise<void>;
  resetImage: () => void;
}
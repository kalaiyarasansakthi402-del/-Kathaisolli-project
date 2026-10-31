export const AUDIO_PROCESSING_QUEUE = 'audio-processing';
export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export interface AudioProcessingTask {
  uploadJobId: string;
}

export interface StoredObjectMetadata {
  sizeBytes: number;
  contentType: string | undefined;
}

export interface UploadForm {
  url: string;
  fields: Record<string, string>;
}

export interface ObjectStorage {
  ensurePrivateBucket(): Promise<void>;
  createUploadForm(
    objectKey: string,
    contentType: string,
    maxBytes: number,
    expiresInSeconds: number,
  ): Promise<UploadForm>;
  headObject(objectKey: string): Promise<StoredObjectMetadata>;
  deleteObject(objectKey: string): Promise<void>;
  downloadToFile(objectKey: string, filePath: string): Promise<void>;
  uploadFile(
    objectKey: string,
    filePath: string,
    contentType: string,
  ): Promise<void>;
  createReadUrl(objectKey: string, expiresInSeconds: number): Promise<string>;
}

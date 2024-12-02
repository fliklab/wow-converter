export interface FileInfo {
  file: File;
  id: string;
  status: "waiting" | "converting" | "completed" | "error";
  preview: string;
  convertedUrl?: string;
}

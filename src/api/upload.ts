import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UploadResult {
    file_id: string;
    url: string;
    type: string;
    size: number;
}

// ─── Upload File ──────────────────────────────────────────────────────────────
// Sends multipart/form-data to POST /upload.
// uri  — local file URI from expo-camera, expo-document-picker, etc.
// mimeType — e.g. 'image/jpeg', 'application/pdf'
// filename — optional override; defaults to last segment of uri
export async function uploadFile(
    uri: string,
    mimeType: string,
    filename?: string,
): Promise<UploadResult> {
    const name = filename ?? uri.split('/').pop() ?? 'upload';
    const formData = new FormData();
    // React Native FormData accepts this special object shape for files
    formData.append('file', {
        uri,
        type: mimeType,
        name,
    } as unknown as Blob);

    const res = await apiClient.post<UploadResult>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

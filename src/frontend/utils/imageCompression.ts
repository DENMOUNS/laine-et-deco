const FIRESTORE_SAFE_IMAGE_BYTES = 80 * 1024; // Lowered to 80 KB to safely support multiple images in Firestore documents
const IMAGE_DATA_URL_PREFIX = /^data:image\/(png|jpe?g|webp);base64,/i;
const LIKELY_IMAGE_KEYS = new Set([
  'image',
  'coverImage',
  'avatar',
  'logo',
  'lien',
  'backgroundImage',
  'background',
  'thumbnail',
]);

const byteLength = (value: string) => {
  const base64 = value.includes(',') ? value.split(',')[1] : value;
  return Math.ceil((base64.length * 3) / 4);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Impossible de lire cette image.'));
    image.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Impossible de compresser l'image."));
    }, type, quality);
  });

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Impossible de lire l'image compressee."));
    reader.readAsDataURL(blob);
  });

export const isImageDataUrl = (value: unknown): value is string =>
  typeof value === 'string' && IMAGE_DATA_URL_PREFIX.test(value);

export const isOversizedImageDataUrl = (value: unknown, maxBytes = FIRESTORE_SAFE_IMAGE_BYTES) =>
  isImageDataUrl(value) && byteLength(value) > maxBytes;

export async function compressImageDataUrl(value: string, maxBytes = FIRESTORE_SAFE_IMAGE_BYTES): Promise<string> {
  if (!isOversizedImageDataUrl(value, maxBytes) || typeof document === 'undefined') {
    return value;
  }

  const image = await loadImage(value);
  let width = image.naturalWidth || image.width;
  let height = image.naturalHeight || image.height;
  let quality = 0.92;
  let output = value;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const scale = Math.min(1, Math.sqrt(maxBytes / Math.max(byteLength(output), 1)) * 0.98);
    if (attempt > 0 || scale < 1) {
      width = Math.max(480, Math.floor(width * scale));
      height = Math.max(480, Math.floor(height * scale));
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return output;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(image, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    output = await blobToDataUrl(blob);

    if (byteLength(output) <= maxBytes) return output;
    quality = Math.max(0.65, quality - 0.05);
  }

  return output;
}

export async function compressImagesInPayload<T>(payload: T): Promise<T> {
  if (typeof payload === 'string') {
    if (isImageDataUrl(payload)) {
      return (await compressImageDataUrl(payload)) as unknown as T;
    }
    return payload;
  }

  if (!payload || typeof payload !== 'object') return payload;

  if (Array.isArray(payload)) {
    const items = await Promise.all(payload.map((item) => compressImagesInPayload(item)));
    return items as T;
  }

  const entries = await Promise.all(
    Object.entries(payload as Record<string, unknown>).map(async ([key, value]) => {
      if (isImageDataUrl(value) && (LIKELY_IMAGE_KEYS.has(key) || isOversizedImageDataUrl(value))) {
        return [key, await compressImageDataUrl(value)];
      }
      if (value && typeof value === 'object') {
        return [key, await compressImagesInPayload(value)];
      }
      return [key, value];
    })
  );

  return Object.fromEntries(entries) as T;
}

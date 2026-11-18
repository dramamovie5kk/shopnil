/** Normalize uploaded brand artwork to a browser-compatible square PNG icon. */
export async function faviconPng(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');canvas.width=64;canvas.height=64;
    const context=canvas.getContext('2d');if(!context)throw new Error('Image conversion unavailable');
    const scale=Math.min(64/bitmap.width,64/bitmap.height);const width=bitmap.width*scale,height=bitmap.height*scale;
    context.drawImage(bitmap,(64-width)/2,(64-height)/2,width,height);
    return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG conversion failed')),'image/png'));
  } finally { bitmap.close(); }
}

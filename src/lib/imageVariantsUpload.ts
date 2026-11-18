/** Generate small copies during admin uploads; original bytes and URL stay intact. */
export async function imageVariantsUpload(file: Blob): Promise<{width:number;blob:Blob}[]> {
  if (!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)) return [];
  const bitmap = await createImageBitmap(file);
  try {
    const variants=[];
    for (const width of [384,960,1600]) {
      const scale=Math.min(1,width/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const context=canvas.getContext('2d');if(!context)continue;
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',0.82));
      if(blob?.type==='image/webp')variants.push({width,blob});
    }
    return variants;
  } finally {bitmap.close();}
}

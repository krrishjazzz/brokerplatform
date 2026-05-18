export async function uploadPropertyImages(files: FileList): Promise<string[]> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    credentials: "include",
  });
  const sign = await signRes.json();

  if (!signRes.ok) {
    throw new Error(sign.error || "Failed to prepare upload");
  }

  return Promise.all(
    Array.from(files).map(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`${file.name} is larger than 5MB`);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sign.apiKey);
      formData.append("timestamp", String(sign.timestamp));
      formData.append("signature", sign.signature);
      formData.append("folder", "krishjazz");
      if (sign.uploadPreset) {
        formData.append("upload_preset", sign.uploadPreset);
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const upload = await uploadRes.json();

      if (!uploadRes.ok || !upload.secure_url) {
        throw new Error(upload.error?.message || `Failed to upload ${file.name}`);
      }

      return upload.secure_url as string;
    })
  );
}

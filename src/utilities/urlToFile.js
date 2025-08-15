export async function urlToFile(url, filename = "image.jpg") {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

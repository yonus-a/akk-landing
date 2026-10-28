/** Canvas textures bake Persian text, so wait for the web font (bounded so a slow CDN can't block the scene). */
export function waitForFonts(timeoutMs = 1500): Promise<void> {
  if (!document.fonts) return Promise.resolve();
  // Explicitly request the weight the textures use: on an English page nothing else triggers it.
  const loaded = Promise.all([document.fonts.load('bold 46px Vazirmatn', 'ت'), document.fonts.ready]).then(() => undefined);
  return Promise.race([
    loaded.catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

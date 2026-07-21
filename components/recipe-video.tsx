// Embed de YouTube vía youtube-nocookie (sin descargar vídeo; respeta los ToS).
export function RecipeVideo({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-ink/5" style={{ aspectRatio: "16 / 9" }}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={`Vídeo: ${title}`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

import { AspectRatio } from "./aspect-ratio.shared";

export function AspectRatioWidescreen() {
  return (
    <div className="w-full max-w-md">
      <AspectRatio
        ratio={16 / 9}
        className="bg-muted rounded-none overflow-hidden border"
      >
        <img
          src="https://picsum.photos/1000/800?grayscale&random=1"
          alt="16:9"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

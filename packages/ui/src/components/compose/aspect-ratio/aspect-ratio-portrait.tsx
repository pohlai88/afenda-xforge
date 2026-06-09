import { AspectRatio } from "./aspect-ratio.shared";

export function AspectRatioPortrait() {
  return (
    <div className="w-full max-w-xs">
      <AspectRatio
        ratio={9 / 16}
        className="bg-muted rounded-none overflow-hidden border"
      >
        <img
          src="https://picsum.photos/1000/800?grayscale&random=5"
          alt="9:16"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

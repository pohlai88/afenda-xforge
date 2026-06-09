import { AspectRatio } from "./aspect-ratio.shared";

export function AspectRatioSquare() {
  return (
    <div className="w-full max-w-xs">
      <AspectRatio
        ratio={1 / 1}
        className="bg-muted rounded-none overflow-hidden border"
      >
        <img
          src="https://picsum.photos/1000/800?grayscale&random=3"
          alt="1:1"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

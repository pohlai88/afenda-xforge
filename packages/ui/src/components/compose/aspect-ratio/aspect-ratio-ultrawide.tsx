import { AspectRatio } from "./aspect-ratio.shared";

export function AspectRatioUltrawide() {
  return (
    <div className="w-full max-w-md">
      <AspectRatio
        ratio={21 / 9}
        className="bg-muted rounded-none overflow-hidden border"
      >
        <img
          src="https://picsum.photos/1000/800?grayscale&random=4"
          alt="21:9"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

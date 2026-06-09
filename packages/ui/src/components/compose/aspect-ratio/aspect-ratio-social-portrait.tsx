import { AspectRatio } from "./aspect-ratio.shared";

export function AspectRatioSocialPortrait() {
  return (
    <div className="w-full max-w-xs">
      <AspectRatio
        ratio={4 / 5}
        className="bg-muted rounded-none overflow-hidden border"
      >
        <img
          src="https://picsum.photos/1000/800?grayscale&random=7"
          alt="4:5"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

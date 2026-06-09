import { AspectRatio } from "./aspect-ratio.shared";

export function AspectRatioStandard() {
  return (
    <div className="w-full max-w-md">
      <AspectRatio
        ratio={4 / 3}
        className="bg-muted rounded-none overflow-hidden border"
      >
        <img
          src="https://picsum.photos/1000/800?grayscale&random=2"
          alt="4:3"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

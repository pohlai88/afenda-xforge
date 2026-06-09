import { AspectRatio } from "./aspect-ratio.shared";

export function AspectRatioClassicPhotography() {
  return (
    <div className="w-full max-w-md">
      <AspectRatio
        ratio={3 / 2}
        className="bg-muted rounded-none overflow-hidden border"
      >
        <img
          src="https://picsum.photos/1000/800?grayscale&random=6"
          alt="3:2"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

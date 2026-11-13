import { AspectRatio } from '@/react/components/ui/AspectRatio'
// The blog card's 5:4 picture and the hero's 2:1 frame at any width.

export default function Product() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <figure className="flex flex-col gap-2">
        <AspectRatio ratio={5 / 4} className="bg-ds-neutral-200">
          <span className="absolute inset-0 flex items-center justify-center type-code-sm text-ds-neutral-500">5:4</span>
        </AspectRatio>
        <figcaption className="type-meta text-fg-muted">A blog card's picture</figcaption>
      </figure>
      <figure className="flex flex-col gap-2">
        <AspectRatio ratio={2} className="bg-home-red">
          <span className="absolute inset-0 flex items-center justify-center type-code-sm text-off-white">2:1</span>
        </AspectRatio>
        <figcaption className="type-meta text-fg-muted">The hero's frame</figcaption>
      </figure>
    </div>
  )
}

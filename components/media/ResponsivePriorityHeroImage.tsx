import { getImageProps } from "next/image";

type ResponsivePriorityHeroImageProps = {
  src: string;
  mobileSrc: string;
  alt: string;
  className: string;
  sizes?: string;
  quality?: number;
  decoding?: "async" | "sync" | "auto";
};

export function ResponsivePriorityHeroImage({
  src,
  mobileSrc,
  alt,
  className,
  sizes = "100vw",
  quality = 35,
  decoding = "async",
}: ResponsivePriorityHeroImageProps) {
  const { props } = getImageProps({
    src,
    alt,
    fill: true,
    priority: true,
    quality,
    sizes,
    className,
    decoding,
  });

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={mobileSrc}
        type="image/avif"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={props.src}
        imageSrcSet={props.srcSet}
        imageSizes={props.sizes}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <picture>
        <source
          media="(max-width: 767px)"
          type="image/avif"
          srcSet={mobileSrc}
        />
        {/* next/image generated these responsive fallback props. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...props} alt={alt} />
      </picture>
    </>
  );
}

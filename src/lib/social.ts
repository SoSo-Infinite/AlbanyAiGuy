import type { Metadata } from "next";

/** Share-card image. Same fields the pages already pass to `openGraph.images`. */
type ShareImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

type SocialInput = {
  title: string;
  description: string;
  url: string;
  /**
   * Omit when the route uses the opengraph-image / twitter-image files.
   * Setting `images` would replace that file-convention card.
   */
  image?: ShareImage;
  type?: "website";
  siteName?: string;
};

/**
 * Page Open Graph plus the matching X card.
 * `twitter` replaces the layout card entirely (shallow metadata merge),
 * so the card type is set here. Title and description are the same strings
 * the page already uses for Open Graph.
 */
export function socialMeta(
  input: SocialInput,
): Pick<Metadata, "openGraph" | "twitter"> {
  const images = input.image ? [input.image] : undefined;
  const shared = {
    url: input.url,
    title: input.title,
    description: input.description,
    ...(input.siteName ? { siteName: input.siteName } : {}),
    ...(images ? { images } : {}),
  };

  const openGraph: Metadata["openGraph"] = input.type
    ? { type: input.type, ...shared }
    : shared;

  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title: input.title,
    description: input.description,
    ...(images ? { images } : {}),
  };

  return { openGraph, twitter };
}

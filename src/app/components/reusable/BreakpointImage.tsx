import type {ComponentProps} from "react";

type Props = Omit<ComponentProps<"img">, "src" | "srcSet" | "sizes"> & {
    src: string;
    alt: string;
    media: string;
};

const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// CSS-hidden eager images still download. Only expose the URL at its layout breakpoint.
// The inactive layout uses an inline source; keep a real img src for image indexing.
export default function BreakpointImage({src, media, alt, ...props}: Props) {
    return (
        <picture className="contents">
            <source media={media} srcSet={src} />
            <source srcSet={TRANSPARENT_PIXEL} />
            <img {...props} src={src} alt={alt} />
        </picture>
    );
}

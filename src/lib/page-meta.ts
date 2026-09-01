import { useEffect } from "react";

type PageMeta = {
  title: string;
  description?: string;
  robots?: string;
};

function setMeta(name: string, content: string): () => void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  const created = !tag;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  const previous = tag.getAttribute("content");
  tag.setAttribute("content", content);
  return () => {
    if (created) {
      tag?.remove();
    } else if (previous !== null) {
      tag?.setAttribute("content", previous);
    }
  };
}

/**
 * Client-side replacement for TanStack Start's per-route `head()`. Sets the
 * document title and (optionally) the description / robots meta tags while the
 * page is mounted, restoring the previous values on unmount.
 */
export function usePageMeta({ title, description, robots }: PageMeta): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const cleanups: Array<() => void> = [];
    if (description !== undefined) cleanups.push(setMeta("description", description));
    if (robots !== undefined) cleanups.push(setMeta("robots", robots));

    return () => {
      document.title = previousTitle;
      cleanups.forEach((fn) => fn());
    };
  }, [title, description, robots]);
}

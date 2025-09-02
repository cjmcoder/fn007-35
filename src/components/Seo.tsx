import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
}

export const Seo = ({ title, description, canonicalUrl }: SeoProps) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [title, description, canonicalUrl]);

  return null;
};

export default Seo;

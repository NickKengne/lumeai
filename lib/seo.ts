/**
 * SEO Utilities for Lume AI
 * This file contains helper functions and constants for SEO optimization
 */

export const siteConfig = {
  name: "Lume AI",
  description: "AI-powered tool that transforms your app screenshots into stunning App Store-ready visuals in under a minute.",
  url: "https://lumeai.com",
  ogImage: "https://lumeai.com/images/og-image.png",
  links: {
    twitter: "https://twitter.com/lumeai",
    github: "https://github.com/lumeai",
  },
  keywords: [
    "App Store screenshots",
    "iOS app marketing",
    "app store optimization",
    "ASO tool",
    "screenshot generator",
    "app mockups",
    "iPhone mockups",
    "app store visuals",
    "mobile app marketing",
    "AI screenshot designer",
    "app launch tools",
    "indie developer tools",
    "app store assets",
    "screenshot automation",
    "app marketing",
    "mobile app design",
    "app store graphics",
    "iOS marketing",
    "app preview images",
  ],
};

export const generateMetadata = (page: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}) => {
  const url = page.path ? `${siteConfig.url}${page.path}` : siteConfig.url;
  const ogImage = page.image || siteConfig.ogImage;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [ogImage],
      creator: "@lumeai",
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noIndex,
    },
  };
};

/**
 * Generate JSON-LD structured data for a page
 */
export const generateStructuredData = (type: "WebApplication" | "FAQPage" | "HowTo", data: any) => {
  const baseStructure = {
    "@context": "https://schema.org",
    "@type": type,
  };

  return {
    ...baseStructure,
    ...data,
  };
};

/**
 * Breadcrumb structured data
 */
export const generateBreadcrumb = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Article/Blog post structured data
 */
export const generateArticle = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
};


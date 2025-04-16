import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Analytics } from "@vercel/analytics/react"
import { prisma } from "@/lib/db";

const inter = Inter({ subsets: ["latin"] });

const getSiteMetadata = async () => {
  return prisma.siteMetadata.findFirst();
}

// Dynamically generate global metadata for the entire application
export const metadata = async () => {
  // Fetch global metadata from the database
  const siteMetadata = await getSiteMetadata();

  return {
    // Default title for the site (shown in browser tabs and search engines)
    title: siteMetadata?.siteTitle || 'Default Title',

    // Default meta description for the entire site (shown in search engine results)
    description: siteMetadata?.siteDescription || 'Default Description',

    // A list of keywords that describe the content of the site (comma-separated in the database, split into an array here)
    keywords: siteMetadata?.keywords?.split(',') || [],

    // Open Graph settings for better integration with social media platforms like Facebook and Twitter
    openGraph: {
      // The title of the site when shared on social media
      title: siteMetadata?.ogTitle || siteMetadata?.siteTitle || 'Default Title',

      // The description shown when the site is shared on social media
      description: siteMetadata?.ogDescription || siteMetadata?.siteDescription || 'Default Description',

      // The main URL of the website
      url: siteMetadata?.siteUrl,

      // The name of the website, displayed on social media previews
      siteName: siteMetadata?.siteName,

      // The image used for social media previews, fetched from the database
      images: [
        {
          // URL of the Open Graph image
          url: siteMetadata?.ogImageUrl,

          // Width of the Open Graph image (typically 1200 for optimal display)
          width: 1200,

          // Height of the Open Graph image (typically 630 for optimal display)
          height: 630,

          // A brief description of the image content (fetched from the database or set a default)
          alt: siteMetadata?.ogImageAlt || 'Default Open Graph Image',
        },
      ],

      // Specifies the type of content (e.g., website, article, etc.)
      type: 'website',
    },

    // Twitter-specific metadata for when the site is shared on Twitter
    twitter: {
      // Type of Twitter card (this one creates a large image preview)
      card: 'summary_large_image',

      // Title of the site for Twitter
      title: siteMetadata?.twitterTitle || siteMetadata?.siteTitle,

      // Description shown in Twitter's preview
      description: siteMetadata?.twitterDescription || siteMetadata?.siteDescription,

      // Image URL used for Twitter sharing
      images: [siteMetadata?.twitterImageUrl],
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers
        >
          {children}
          {/* https://images.squarespace-cdn.com/content/v1/627cb6fa4355783e5e375440/f1083091-79f6-4750-b867-e1bc587dfca0/rust_12_minicopter.jpg */}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

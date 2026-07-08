import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitWrapped",
    short_name: "GitWrapped",
    description: "Transform your public GitHub activity into a premium, cinematic annual coding recap.",
    start_url: "/",
    display: "standalone",
    background_color: "#02040a",
    theme_color: "#02040a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

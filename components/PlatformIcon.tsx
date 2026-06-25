"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faTiktok,
  faFacebook,
  faInstagram,
  faXTwitter,
  faVimeoV,
  faPinterest,
  faRedditAlien,
} from "@fortawesome/free-brands-svg-icons";
import type { Platform } from "@/lib/types";

const iconMap: Record<string, typeof faYoutube> = {
  youtube: faYoutube,
  "youtube-shorts": faYoutube,
  tiktok: faTiktok,
  facebook: faFacebook,
  instagram: faInstagram,
  twitter: faXTwitter,
  vimeo: faVimeoV,
  pinterest: faPinterest,
  reddit: faRedditAlien,
};

export default function PlatformIcon({ platform, className = "" }: { platform: Platform; className?: string }) {
  const icon = iconMap[platform];
  if (!icon) return null;
  return <FontAwesomeIcon icon={icon} className={className} />;
}

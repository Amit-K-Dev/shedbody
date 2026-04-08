import { siGoogle, siFacebook, siX, siLinkedin } from "simple-icons";
import { Mail } from "lucide-react";

export function SocialIcon({ provider }) {
  const icons = {
    google: siGoogle,
    facebook: siFacebook,
    twitter: siX,
    linkedin: siLinkedin,
    mail: Mail,
  };

  const icon = icons[provider];

  if (!icon) return null;

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={`#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
}

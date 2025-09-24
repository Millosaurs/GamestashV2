import SocialCard from "@/components/forgeui/social-card";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { GiStrikingDiamonds } from "react-icons/gi";

export function SocialCardExample() {
  return (
    <SocialCard
      image="https://forgeui.amanshakya.in/pfp.png"
      title="Social Card"
      name="creator.exe"
      pitch="Explore my latest projects and connect for collaboration opportunities"
      icon={<GiStrikingDiamonds />}
      buttons={[
        {
          label: "Twitter",
          icon: <FaXTwitter />,
          link: "https://x.com/amanshakya0018",
        },
        {
          label: "Github",
          icon: <FaGithub />,
          link: "https://github.com/amanshakya0018",
        },
      ]}
    />
  );
}

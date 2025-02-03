export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "whereisICE",
  description: "Crowd-sourced ICE reporting and analytics website",
  navItems: [
    {
      label: "Map",
      href: "/",
    },
    {
      label: "Location Reports",
      href: "/reports",
    },
    {
      label: "Analytics",
      href: "/analytics",
    },
    {
      label: "Get Help",
      href: "/help",
    },
    {
      label: "Donate",
      href: "/donate",
    }
  ],
  navMenuItems: [
    {
      label: "Map",
      href: "/",
    },
    {
      label: "Location Reports",
      href: "/reports",
    },
    {
      label: "Analytics",
      href: "/analytics",
    },
    {
      label: "Get Help",
      href: "/help",
    },
    {
      label: "Donate",
      href: "/donate",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "How does it work?",
      href: "/how-it-works",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};

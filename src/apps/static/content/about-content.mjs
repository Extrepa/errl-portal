export const aboutPageContent = {
  hero: {
    eyebrow: "A threshold, not a brochure",
    title: "Errl is a soft creature at the edge of a darker room.",
    subtitle:
      "This place was drawn before it was coded. What you are reading is lore, not a résumé — notes left behind for anyone who wanders in.",
    intro: [
      "ERRL began as ink and festival light, long before any of these pages existed.",
      "The site is built with machines; the feeling is not. If something here glows, it is trying to remember a dream.",
    ],
  },
  sections: [
    {
      id: "what-is-errl",
      title: "What lives here",
      kicker: "Portal, archive, breathing interface",
      body: [
        "ERRL is not a product launch. It is a room you can enter — part myth, part workshop, part unfinished song.",
        "Some doors are polished. Some hum quietly behind the wall. The forum holds the threads that tie the world together.",
        "You are not meant to consume everything. Follow what pulls you.",
      ],
    },
    {
      id: "vibe-coding",
      title: "How the walls were built",
      kicker: "Curiosity, not roadmap",
      body: [
        "These pages were assembled in the open: prototypes stacked on prototypes until the air got thick enough to stand in.",
        "Tools helped. Instinct steered. Nothing here pretends to be finished — only alive.",
        "Studio is the lab bench. Gallery is the wall of things that survived the night.",
      ],
      tools: ["Late sessions", "Glowing SVG", "Half-true rumors", "Forum whispers"],
    },
  ],
  extrepa: {
    title: "Notes from the operator",
    kicker: "Extrepa — keeper of the doorway",
    imageAlt: "Silhouette at the threshold",
    currentlyBuilding: "Tuning the portal: quieter menus, deeper rooms, stranger light.",
    bio:
      "Extrepa tends the ERRL continuum — part artist, part archivist, part person who cannot stop rearranging the stars on the ceiling.",
    links: [
      { label: "Return to the dark", href: "/" },
      { label: "Studio", href: "/studio/" },
      { label: "Forum", href: "https://forum.errl.wtf" },
    ],
    obsessions: [
      "Interfaces that feel like organisms",
      "Sound as architecture",
      "Secrets that reward patience",
    ],
  },
  explore: {
    title: "Where to drift",
    subtitle: "Four paths. No scoreboard.",
    cards: [
      {
        title: "Forum",
        description: "The backbone — community, downloads, hidden threads, future unlocks.",
        href: "https://forum.errl.wtf",
        cta: "Enter the forum",
      },
      {
        title: "Gallery",
        description: "Curated light — art, pins, experiments that made it out of the dark.",
        href: "/gallery/",
        cta: "Walk the gallery",
      },
      {
        title: "Studio",
        description: "The laboratory — prototypes, devlogs, tools still warm from the bench.",
        href: "/studio/",
        cta: "Open the studio",
      },
      {
        title: "Portal",
        description: "Return to the center. Errl is still breathing.",
        href: "/",
        cta: "Back to Errl",
      },
    ],
  },
};

# Morrow Coffee Bar — build plan

## Reading of the brief
A premium coffee-shop landing page for curious local regulars, using a warm editorial / kinetic café language and a tactile, asymmetrical coffee-ritual composition.

## Design dials
- **DESIGN_VARIANCE 8/10:** asymmetrical hero, orbiting cup stage, tilted location card, editorial spacing.
- **MOTION_INTENSITY 9/10:** scroll reveals, marquee, cursor-reactive cup, steam loop, hover states, mobile slide rail.
- **VISUAL_DENSITY 4/10:** generous negative space and a focused menu instead of repetitive card grids.

## Design system
- **Movement:** slow coffee ritual meets contemporary editorial poster.
- **Principles:** tactile, warm, specific, unhurried.
- **Palette:** paper cream for daylight, espresso brown for depth, coffee caramel for flavor, orange for the ownable spark.
- **Typography:** Fraunces for the expressive voice; DM Sans for clarity; DM Mono for small operational labels.
- **Signature motifs:** orbit line around the hero cup, coffee-ring stamp, small bean/steam illustrations.
- **Brand essence:** a small coffee bar that makes the everyday feel considered. Personality: warm, observant, quietly playful.
- **Voice:** direct and human. Example lines: “Good days start here.” / “There is no wrong answer.”
- **Wordmark:** MORROW with a circle-and-dot mark suggesting a cup, sun, or a morning starting point.

## Interaction + motion
- Hero cup follows pointer in a restrained two-speed-feeling parallax; it communicates tactility and is disabled under reduced motion.
- Steam is ambient atmosphere, not content; it pauses into a static soft mark for reduced motion.
- Ritual cards use hover movement only for affordance, while content remains readable and static.
- Menu tabs are state feedback: list content changes immediately, with no layout animation.
- Reveal-on-scroll establishes hierarchy and is replaced by static content for reduced motion.

## Project structure
- `index.html`: single-page, semantic landing page with all styles and interaction for fast static hosting.
- `manus-routes.json`: route manifest for the single `/` page.
- `plan.md`: source-of-truth design and implementation choices.

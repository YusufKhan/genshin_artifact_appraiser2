This app calculates an artifact roll value as a percentage of that artifact vs one with perfect substats and max rolls.
The roll values are weighted by the importance of the substat.
See the page.tsx or the live web-page for more usage information.

Basic player data is pulled directly from Enka.Network without the use of any wrapper.

The loc (localization) and character files are not needed here since the data has already been processed into JSON weights file.

Future Plans

- Add some compensation for ER required
- Add TTL check, or some cache lifespan
- Improve background
- Alternating color weights table rows
- Link to Enka for specified UID
- Pull saved builds from Enka account
  - Add extra weights entry for saved builds
  - Show team, rotation details / saved to Enka build name
- Group characters by artifact set and domain
- Display table of off-set pieces

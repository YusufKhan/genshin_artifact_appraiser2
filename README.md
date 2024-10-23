This tool was primarily created to find where a Sanctifying Elixir can best be used.
It can also help with artifact farming priority.

The main feature is a Roll Value calculator that uses custom weightings to show artifact strength in specific teams.
These roll values should only be compared across characters with high investment (200 CV+) and balanced crit ratios.

How it works:
Characters have a table with weightings based on how much a substat has/will increase their total damage.
The starting values for a character come from their most popular team and rotation.
The weightings are used to calculate a maximum value for an artifact slot, and the equipped artifact strength is given as a percentage of that maximum.
Characters are then ranked by an average gear score.

Future Plans
 - Get vary tall image
 - Split getCharacterData and push to rolls calc
 - Move weights data structure to JSON file
 - Only show Enka character weights
 - Squash commits
 - Change function order in page
 - Alternating color weights table rows
 - Editable weightings table and submit for recalculation
 - Break down calculation on hover
 - Show team, rotation details
 - Group characters by artifact set and domain
 - Display table of off-set pieces
 - Save character list between refreshes (will need character removal feature)
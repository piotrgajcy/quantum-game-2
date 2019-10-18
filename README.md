# quantum-game-2
Quantum Game 2 from CQT

## develop
`yarn` followed by `yarn serve`

## TODO:

### GAME
- [ ] adddrag and drop

### GAME:
- [ ] click listeners;
- [ ] drop listeners;
- [ ] drag

### ENCYCLOPEDIAs
- [ ] add inline styling for images
- [ ] add aria attributes for folded panes

### MAINTENANCE

### BUGS
- [ ] entry seciton scrollHeight bug, where the open entry section max height is ill-calculated, resulting in the text not fitting in. Might be correlated to flex / screen width;
- [x] ERROR in /home/kuba/Desktop/190913QUANTUM/quantum-game-2/src/views/GameContainer.vue 32:23 Could not find a declaration file for module '../game/levels'. '/home/kuba/Desktop/190913QUANTUM/quantum-game-2/src/game/levels/index.js' implicitly has an 'any' type.

14.10:
- [x] Scaffold menu
- [x] Include Menu button into the layout
- [x] serve images in entries
- [x] make the isOpen in entry section be prop-derived

15.10
- [x] review push
- [x] get the menu icon into the foreground
- [x] make the q-menu listen to enc key press
- [x] menu enter/leave animation
- [x] make the entry sections titles uppercase
- [x] create turning arrows indicating folded panes
- [x] qMenu items are offsetted right with width of the icon
- [x] adjustments by from Klem I

16.10
- [x] Host in on Firebase
- [x] Have as dependency https://github.com/sneakyweasel/quantumweasel;
- [x] type levelData

17.10
- [x] displaying frames
- [x] propertly order frames without overwriting the last one (thanks lodash deep clone! :*);
- [x] Create a working GameContainer - meanning initializing the Game object
- [x] Simplify Cells as per https://github.com/sneakyweasel/QuantumDisplay
- [x] Adjust the board
- [x] display elements graphix;
- [x] have the simulation going

18.10
- [x] enhance q-button with inline,
- [x] enhance simulator viewer with internal viewing control
- [x] create layout for Game
- [x] Turn simulation into Your Photon section;
- [x] move components into game directory
- [x] create a component placeholder for goals;
- [x] create a component placeholder for controls
- [x] create a component placeholder for tools
- [x] get rid of conflicting prettier configs, editorconfig
- [x] scope styles across the app
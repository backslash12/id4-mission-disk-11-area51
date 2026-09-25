ID4 – MISSION DISK 11: AREA 51

Playable offline recreation for Browser

=======================================


GET STARTED


1. Extract the ZIP file completely.

2. In the extracted folder, open index.html with Firefox or Chromium.


Alternatively, in the terminal for this folder:


    bash Start.sh


The game runs entirely offline. All you need is a browser.

No installation, no Wine, no Windows EXE, and no server required.

The “assets” folder must remain next to “index.html.”


PLAY


Read the instructions and click on the image or press Enter.

Then click on the original commands at the bottom of the screen.

Private Jones will execute one command at a time. Wait during animations.


LIGHTS ON/OFF   Turn lights on / off

RAISE/LOWER SHIP   Raise / lower the ship

OPEN/CLOSE DOORS   Open / close the outer gate

LOAD ORDNANCE   Load ammunition

DRAIN/FILL TANK   Empty / fill the alien container

LAUNCH SHIP   Initiate launch

RESTART   New mission

QUIT   Show original credits


Keyboard: L = Lights, U = Lift, O = Gate, A = Ammunition,

T = Tank, Enter = Start / Continue text, R = Restart, Q = Credits.

F = Full screen, M = Sound on/off, H = Help.

When a screen button is highlighted, pressing Enter activates that button.


During loading: the first click stops scrolling if necessary,

the next click continues. After a result: green = play again,

red = credits. During the credits, one click takes you back to the beginning.


The image adjusts to the window size at startup. “Pixel Size” selects

an integer magnification where possible; use “Zoom In” to

return to window size. The background graphic is 1280 × 960 pixels.

All game commands, transmissions, selection texts, and credits are

displayed on top of it as true scalable text. This font remains

sharp even on a 4K screen; press F to enter full-screen mode.

The game pauses when switching tabs or opening the help menu.

Press “Continue” or close the help menu to resume.

To exit completely, close the browser window.


WHAT THIS VERSION INCLUDES


A rewritten game engine featuring the original graphics, animations, sound sequences,

broadcasts, and the original credits derived from your uploaded

playthrough. The old, blurry text

has been re-rendered using local vector fonts based on the original.

The visual design of the scenes continues to be based on the original video.


The video sequences serve as animation layers. Lighting, fuel tank, lift platform,

gate, and ammunition status are managed independently. Your commands determine

the order and outcome of the mission; there is no linear

cinematic sequence serving as a substitute for gameplay.


Included are the successful launch and the four failed attempts shown in the video:

loading ammunition while the ship is lowered, launching with the gate closed,

launching without ammunition, and launching in the dark.


LIMITATIONS OF THE RECONSTRUCTION


The original AREA51.EXE and its source code are not included

in this version. The source material is the uploaded video, so this

version cannot guarantee a complete 1:1 match for all unknown original

game rules or the original uncompressed pixels.


Counter-movements not shown in the video (lowering the stage, closing the gate)

use derived reverse animations. Additional actions in the dark

are darkened from the bright animations. An unobserved start with

the ship lowered is rejected with a message. In this case,

no supposedly original error message was invented.


The exact list of source sequences is provided in ASSET-SOURCES.json.

The HD version sharpens and enlarges the scene graphics to 1280 × 960.

Moving scenes run through calculated interpolated frames at 60 instead of 30

frames per second. The source material contains no additional image details

beyond its 640 × 480 pixels. The optical flow calculation may produce

slight interframe artifacts with fast-moving objects.

The 4K sharpening affects the newly rendered text, not the original

graphical details in the video. The typography is a legible approximation of

the original, as its uncompressed original font is not available.

Original game: ID4 Mission Disk 11 / Area 51, 1996, Trendmasters.

The copyright notices shown in the original are preserved in the graphics and credits.

This recreation is not an official re-release.


FILES


index.html          Open game

Start.sh            Ubuntu launcher

game.js             Display, input, animations, and sound

typography.js       Vector text and overlays

rules.js            Game state and rules

style.css           Game window styling

assets/             All local graphics, fonts, sound/animation files

ASSET-SOURCES.json   Sources of the image sequences used

TEST.txt        Summary of the tests performed


IF YOU ENCOUNTER PROBLEMS


Do not run the program directly from the ZIP file; extract all files first.

If you receive an error message, be sure to open index.html using Firefox or Chromium.

To run Start.sh, simply type “bash Start.sh”; a lack of

execution permissions will not prevent this method from working.

If there is no sound, select “Sound On” and click once inside the game area.


SOLUTION (SPOILER)


LIGHTS ON → RAISE SHIP → OPEN DOORS → LOAD ORDNANCE → LAUNCH SHIP.

The large container on the left contains an alien; it is not a fuel tank.

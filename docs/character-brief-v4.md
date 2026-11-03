This section defines how the character looks, moves, and animates throughout the entire site. The character must look like Durgesh Shukla and remain visually identical in every single chapter.

CHARACTER DESIGN — DURGESH

The character is a 3D low-poly stylised boy (the same art style as the existing diorama objects — NOT realistic, NOT anime, NOT corporate mascot). He must look like the same person in every chapter.

Physical appearance (LOCK THIS — never change between chapters):

Body type: slightly chubby, friendly build, approachable proportions
Skin tone: warm brown (
#8D6E63)
Hair: black, slightly messy, short, thick — NOT styled or gelled
Face: round, large expressive eyes (dark brown 
#3E2723), thick eyebrows, small nose, wide friendly mouth
Head-to-body ratio: slightly large head (about 1:3.5) — this makes him recognisable at small diorama scale
Height in scene: approximately 15-20% of the diorama height — he should be clearly visible but not dominate the scene
Art style: smooth low-poly surfaces, warm shading, 3D rendered to match the book diorama style. Same rendering quality as the desks, trees, buildings already in the scenes

Outfit changes per chapter (ONLY the clothes change, face and body stay identical):

Chapters	Age	Outfit	Backpack
01–02 (Kanpur, JEE)	~16-17	Light blue t-shirt, grey shorts, brown sandals	Small brown school bag
03–04 (College, Noida arrival)	~20	Yellow/orange t-shirt, blue jeans, white sneakers	Medium olive backpack
05–06 (GoCattles)	~21	Green polo shirt, dark jeans, white sneakers	Same olive backpack
07–13 (BackWithBrain)	~22	Light blue button shirt with sleeves rolled up, dark trousers	Larger dark backpack with stickers
14 (Voice)	~23	Grey hoodie, dark jeans	Same backpack with laptop bag strap visible
15 (Smaran)	~23	White t-shirt, joggers (home setting)	No backpack — he is at home
16 (Wispr Growth)	~23	Clean white shirt, dark trousers, neat look	Full backpack, slightly glowing golden outline

CHARACTER POSES (one per chapter)

Each chapter shows the character in a different pose that communicates the story WITHOUT reading text. The pose should be immediately clear at diorama scale.

Chapter 01 (Kanpur): EXPLORING — walking with one hand shielding eyes, looking at something in the distance. Curious posture, leaning slightly forward.

Chapter 02 (JEE/crossroads): STANDING AT CROSSROADS — standing still, hands at sides, looking at two paths. Slight head tilt. Not sad, not defeated — thoughtful.

Chapter 03 (College): WALKING THROUGH CAMPUS — casual confident walk, one hand on backpack strap, looking around at the buildings.

Chapter 04 (Noida arrival): SITTING IN AUTO-RICKSHAW — legs inside the auto, backpack on lap, looking out at the city. If the auto model exists, place him inside it.

Chapter 05 (GoCattles): WORKING AT DESK — seated at desk, typing on laptop, slightly leaned forward. Dog sitting next to the desk (already exists in the scene).

Chapter 06 (Prime Day): SITTING AND THINKING — seated on the floor or on a box, elbows on knees, chin in hand. Surrounded by unsold boxes. Looking slightly downward. This is the failure pose — not crying, not dramatic, just reflecting.

Chapter 07 (Bengaluru): ARRIVING — stepping off a bus or walking with a suitcase, looking up at the city buildings. Expression: excited but slightly nervous.

Chapter 08 (Community/park): TALKING TO PEOPLE — standing in the park, one arm gesturing, talking to 2-3 small NPC figures. Other hand holding a small leaflet or notebook.

Chapter 09 (7-day programme): LOOKING AT DATA — standing next to the day-1 through day-7 calendar boards, one hand pointing at the declining numbers, expression concerned.

Chapter 10 (Accountability partners): CONNECTING PEOPLE — standing on the bridge (already in the scene), hands extended toward two groups of people on either side. The bridging pose. Expression: determined, slightly smiling.

Chapter 11 (Daily Detox): TALKING TO CUSTOMER — seated across from an NPC figure, leaning forward, notebook open, listening. This shows “I went and talked to users.” Expression: focused, listening.

Chapter 12 (Research): STUDYING — seated at research desk, surrounded by papers and competitor boards, one hand on chin, other hand turning a page. Expression: concentrated.

Chapter 13 (Product design): DESIGNING — standing at a whiteboard or screen, drawing/pointing at wireframes. Expression: creative focus.

Chapter 14 (Voice): SPEAKING — seated at desk with hand raised near mouth (dictating gesture), sound wave lines floating near his face. Eyes looking at screen where text is appearing.

Chapter 15 (Smaran): BUILDING AT HOME — seated cross-legged on the floor or at a small home desk, laptop open, phone nearby showing the Smaran interface. Expression: warm, personal, focused.

Chapter 16 (Wispr Growth): LOOKING FORWARD — standing on the India map on the book pages, facing right/forward, one foot slightly ahead as if about to step off the book. Backpack glowing. Expression: confident, ready.

CHARACTER ANIMATIONS

Every chapter must have character animation. The character should NEVER be a static image.

A. IDLE ANIMATION (plays in every chapter when nothing else is happening):

Subtle breathing: chest/torso scales vertically 1.0 → 1.01 → 1.0, duration 3s, infinite, ease-in-out
Occasional blink: eyes close to half-size then reopen, every 4 seconds, 0.15s duration
Very slight weight shift: body translateX -1px → 0 → 1px → 0, duration 5s, infinite, ease-in-out
These three animations run simultaneously and make the character feel alive

B. CHAPTER ENTRY ANIMATION (plays once when a new chapter loads):
The character does NOT just appear. He enters the scene:

Chapters 01, 03, 04, 07: character walks in from the left edge of the diorama (translateX -60px → final position, 0.8s, ease-out) while playing a walk cycle (slight arm swing + leg movement, 4 frames)
Chapters 05, 06, 09, 11, 12, 13, 14: character fades in at his seated/standing position (opacity 0 → 1, scale 0.95 → 1.0, 0.5s)
Chapter 08: character walks into the center of the park from the office building (translateX + translateZ movement, 1s)
Chapter 10: character walks to the center of the bridge (translateX to center, 0.8s)
Chapter 15: character is already seated, room lights up gradually around him (scene brightness 0.7 → 1.0, 0.8s)
Chapter 16: character walks to the edge of the book and stops, looking out (translateX to right edge, 1s, then turns head slightly right)

C. POSE-SPECIFIC ANIMATIONS (looping after entry):

Working at desk (Ch 05, 12, 14):

Slight head bob as if reading (rotateX -2deg → 0 → -2deg, 4s loop)
Occasional hand movement on keyboard (translateY of hand: 0 → -3px → 0, 2s, every 5 seconds)

Thinking/reflecting (Ch 06):

Very slow head turn left → center → right → center (rotateY -5deg → 0 → 5deg → 0, 8s loop)
One hand occasionally moves to scratch head (translateY -5px, 0.3s, every 10 seconds)

Talking to people (Ch 08, 11):

Gesturing hand moves up → down → up (translateY, 1.5s loop)
Head nods occasionally (rotateX 0 → -5deg → 0, 0.4s, every 4 seconds)

Standing/looking (Ch 02, 07, 16):

Weight shift side to side (translateX -2px → 2px, 4s loop)
Head slowly scanning the environment (rotateY -10deg → 10deg, 6s loop)

Connecting people on bridge (Ch 10):

Arms slowly extend outward (rotateZ of arms: 0 → 15deg, 2s) then hold
Small particles/lines occasionally appear between the character and the people groups (connection visualization)

Speaking/dictating (Ch 14):

Hand near mouth moves slightly (translateY oscillation, 1s loop)
Sound wave dots appear near mouth (3 small circles that scale up and fade out, staggered, looping)

D. PAGE-TURN CHARACTER TRANSITION:
When navigating between chapters:

Current character fades out (opacity 1 → 0, 0.3s)
Page turns (0.5s)
New character fades/walks in with the chapter entry animation (0.5-0.8s)
Total transition: ~1.3-1.6s

NPC CHARACTERS

Small figures that appear in some scenes. They are simpler than the main character — basic shapes, no facial detail, just colored body + head.

Colors: use 4-5 different shirt colors (
#E07B5B terracotta, 
#457B9D blue, 
#6B705C olive, 
#B8A9C9 lilac, 
#E6A817 mustard) so they look like different people.
Size: 60% of main character height.
Animation: very subtle idle sway (translateX ±1px, 4s loop, random phase offsets so they don’t all move in sync).

Appear in:

Chapter 08 (park): 5-6 NPCs in meditation circle + 2-3 approaching
Chapter 09 (7-day): 3-4 NPCs representing participants
Chapter 10 (bridge): 2-3 NPCs on each side of the bridge
Chapter 11 (Daily Detox): 2 NPCs talking to the character

SCENE TRANSITION ANIMATIONS (between chapters)

The full sequence when visitor clicks “Next Chapter →”:

0.0s–0.3s: Left panel content fades out (opacity 1 → 0, translateY 0 → -10px). Right panel fades out same way.
0.2s–0.5s: Character plays exit (fade out or walk off screen). 3D objects on current page sink slightly (translateY 0 → 5px, opacity 1 → 0.5).
0.3s–0.8s: PAGE TURN — the right book page lifts from its right edge, bends as it rotates (CSS perspective + rotateY, the page mesh curves), passes over the spine, settles on the left. Shadow sweeps across during the turn. New page content is revealed underneath.
0.8s–1.4s: New 3D objects rise from the new page (translateY -15px → 0, opacity 0 → 1, staggered 0.06s per object). Lighting adjusts to new scene color temperature.
1.0s–1.5s: New character enters (walk in or fade in with scale).
1.2s–1.7s: Left panel new content fades in (translateY 10px → 0, opacity 0 → 1, stagger: title 0s, category 0.1s, text 0.2s, lesson 0.3s). Right panel fades in same way.
1.4s–2.0s: Voice card slides in from right if this chapter has one (translateX 40px → 0, opacity 0 → 1).
1.5s: Annotation labels appear (fade in, scale 0.9 → 1, staggered).

Easing for all: cubic-bezier(0.4, 0, 0.2, 1)

For “← Previous Chapter”: same sequence but mirrored — page turns the other direction.

BOOK CLOSING ANIMATION (after Chapter 16)

0.0s–0.5s: Chapter 16 3D objects sink into the pages (translateY 0 → 10px, opacity 1 → 0). Character walks to center of book and stops.
0.5s–0.8s: Character slowly fades (opacity 1 → 0, scale 1 → 0.9).
0.8s–2.0s: Right page slowly lifts and folds over to the left. Then left page folds onto the right. The book closes. Use CSS 3D transforms with perspective for the folding. Pages should have visible thickness during the fold.
2.0s–2.5s: The closed book settles. The cover text “DURGESH SHUKLA · THE BOOK OF MY JOURNEY” is embossed in gold on the dark green cover.
2.5s–3.0s: Camera slowly pulls back and slightly upward, revealing more of the dark wood surface below.
3.0s onward: The post-book sections become visible as the visitor scrolls down past the closed book.

AMBIENT SCENE ANIMATIONS (always running)

These apply to every chapter and make the world feel alive:

Floating dust particles: 5-8 very small circles (2-3px), color rgba(255,255,255,0.06), floating slowly upward (translateY -200px over 15-20s, randomized start positions and speeds). Reset to bottom when they reach the top. These are BARELY visible — atmosphere only.
Warm light flicker: the main directional light intensity oscillates very subtly (brightness 1.0 → 0.98 → 1.0, 4s loop). This simulates a warm room with natural light variation.
Book page micro-movement: the book pages have a very very subtle wave motion at the edges (translateY of page corners: 0 → 0.5px → 0, 6s loop). This makes the book feel like real paper in a room with slight air movement.
Scene shadow breathing: the contact shadows under objects subtly change size (scale 1.0 → 1.02 → 1.0, matching the light flicker timing). This connects the shadows to the light.

INTERACTIVE BUTTON ANIMATIONS

The yellow dot buttons (“Board the train”, “Open the laptop”, etc.):

Idle state:

Yellow circle: 
#D9A64C, 12px diameter
Label: dark rounded pill, 13px Inter 500
Glow: box-shadow 0 0 8px rgba(217,166,76,0.3)
Pulse: scale 1 → 1.15 → 1, 2s infinite ease-in-out
Glow pulse: box-shadow opacity 0.3 → 0.5 → 0.3, same timing

Hover state:

Circle grows: scale 1.3
Glow intensifies: box-shadow 0 0 16px rgba(217,166,76,0.5)
Label: background lightens slightly
Cursor: pointer
Transition: 0.2s ease

Click state:

Circle: scale 0.9 then back to 1.0 (spring: 0.15s)
The connected object in the scene highlights (brightness increases, or a golden outline appears for 0.5s)
If clicking opens additional info: info panel slides in from the relevant direction

PERFORMANCE RULES FOR ANIMATIONS

Use CSS animations and transforms wherever possible (GPU accelerated)
Use will-change: transform on all animated elements
Cap particle count at 8
Cap simultaneous animations per scene at 15
Disable all decorative animations (particles, dust, light flicker, page wave) when “Reduce Motion” is active. Keep only functional transitions (page turn, panel fade) but make them instant (0.1s duration)
On mobile: reduce particle count to 3, disable page wave, simplify page turn to a crossfade (0.3s)
requestAnimationFrame for any JS-driven animations
60fps target on mid-range devices
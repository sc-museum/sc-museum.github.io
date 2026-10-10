/* Room mini-game content. One game per room, keyed by room id without "room-". Every fact comes from that room's own page text. The object below is strict JSON. */
window.ROOM_GAMES = {
  "lobby": {
    "type": "quiz",
    "title": "Which Room Would You Visit?",
    "intro": "Read each clue and pick the room in the museum where you would find it.",
    "questions": [
      { "q": "You want to learn about wig-wag flags, torches, Morse and the telegraph. Which room do you visit?", "choices": ["Civil War Signal Annex", "Satellite Annex", "Donor Spotlight", "Heritage Magazine"], "answer": 0, "why": "The directory says the Civil War Signal Annex covers wig-wag flags, torches, Morse and the telegraph." },
      { "q": "You want to see Army balloons and the first military airplane. Where do you go?", "choices": ["Weather Annex", "Command Gallery", "Aviation Annex", "Fireside Chats"], "answer": 2, "why": "The Aviation Annex runs from Army balloons and the first military airplane to the winter flying school in Augusta." },
      { "q": "Which room tells the story that begins with a radar echo off the Moon?", "choices": ["The Hello Girls", "Satellite Annex", "Timeline", "Camp Gordon: The WWI Era"], "answer": 1, "why": "The Satellite Annex goes from a radar echo off the Moon to satellite training at Fort Gordon." },
      { "q": "Which room is about 223 women, one war, and a medal a century in the making?", "choices": ["Honor Roll", "Combat Camera & Video", "The Cyber Story", "The Hello Girls"], "answer": 3, "why": "The directory describes The Hello Girls as 223 women, one war, and the medal a century in the making." },
      { "q": "Where would you go for Signal Corps film and photography, from Dr. Seuss to The Longest Day?", "choices": ["Combat Camera & Video", "Auditorium", "News & Announcements", "The Signal Story"], "answer": 0, "why": "Combat Camera & Video covers Signal Corps film and photography, from Dr. Seuss to The Longest Day." },
      { "q": "You want to watch any video in the museum's collection. Which room has them all?", "choices": ["Fireside Chats", "Support the Museum", "Auditorium", "Weather Annex"], "answer": 2, "why": "The Auditorium holds every video in the museum's collection, organized by exhibit." },
      { "q": "Which room lets you try reading a weather map?", "choices": ["Fort Gordon, Then and Now", "Weather Annex", "Command Gallery", "Aviation Annex"], "answer": 1, "why": "The Weather Annex tells the story of the nation's weather service and lets you read a weather map." }
    ]
  },
  "auditorium": {
    "type": "quiz",
    "title": "This Month in History",
    "intro": "Answer these questions about the Signal Corps anniversaries listed in This Month in History.",
    "questions": [
      { "q": "Who was Cher Ami, who carried a message for the Lost Battalion in October 1918?", "choices": ["A radio operator", "A Signal Corps pigeon", "A telephone operator", "An Army pilot"], "answer": 1, "why": "Cut off in the Argonne Forest, Maj. Charles Whittlesey's men sent a message by Signal Corps pigeon, and Cher Ami reached his loft badly wounded." },
      { "q": "On October 4, 1957, Signal Corps engineers at the Deal Test Area were the first U.S. government team to detect and record signals from what?", "choices": ["The Moon", "A weather balloon", "A Wright airplane", "Sputnik I"], "answer": 3, "why": "When the Soviet Union launched Sputnik I, Signal Corps engineers at Deal were the first U.S. government team to detect and record its signals." },
      { "q": "Who taught two Army lieutenants to fly at College Park, Maryland, in October 1909?", "choices": ["Wilbur Wright", "Albert J. Myer", "Adolphus W. Greely", "Cleveland Abbe"], "answer": 0, "why": "Formal flight training began at College Park on October 9, 1909, with Wilbur Wright teaching two Army lieutenants." },
      { "q": "At the height of the Meuse-Argonne fighting, how many calls a day did Grace Banker's telephone operators connect?", "choices": ["150", "1,500", "150,000", "15 million"], "answer": 2, "why": "At the height of the fighting the Signal Corps telephone operators connected 150,000 calls a day." },
      { "q": "On November 1, 1870, Signal Service observer-sergeants at 24 stations did what for the first time?", "choices": ["Flew an airplane", "Took synchronized weather readings and telegraphed them to Washington", "Launched a satellite", "Opened a film studio"], "answer": 1, "why": "At 7:35 a.m. on November 1, 1870, observer-sergeants at 24 stations took the first synchronized weather readings and sent them by telegraph to Washington, D.C." },
      { "q": "On December 7, 1941, two Signal Corps privates at Opana saw a large echo on their radar and telephoned it in. What were they told?", "choices": ["\"Sound the alarm\"", "\"Send it by pigeon\"", "\"Shut the radar down\"", "\"Forget it\""], "answer": 3, "why": "Pvts. Lockard and Elliott telephoned the information center at Fort Shafter but were told to \"Forget it.\"" },
      { "q": "In December 1958 the SCORE satellite broadcast a taped Christmas greeting from which President?", "choices": ["President Eisenhower", "President Lincoln", "President Grant", "President Theodore Roosevelt"], "answer": 0, "why": "SCORE broadcast a taped Christmas greeting from President Eisenhower from orbit." }
    ]
  },
  "signal-story": {
    "type": "order",
    "title": "From Flags to Fort Gordon",
    "intro": "Put these moments from the Signal Story in order, earliest first.",
    "items": [
      { "label": "The U.S. Army Signal Corps is established and Major Albert J. Myer begins organizing it", "when": "1860" },
      { "label": "Camp Gordon is built as a division training post", "when": "1941" },
      { "label": "The Army activates the Signal Corps Training Center at Camp Gordon", "when": "1948" },
      { "label": "The post is made permanent and renamed Fort Gordon", "when": "1956" },
      { "label": "The Army establishes the Signal Corps Regiment with Fort Gordon as its home", "when": "1986" }
    ]
  },
  "cyber-story": {
    "type": "quiz",
    "title": "Defend, Attack, Exploit",
    "intro": "See what you remember about the Army's youngest branch.",
    "questions": [
      { "q": "Which three words appear on the Cyber Center of Excellence crest?", "choices": ["Signal, Send, Receive", "Defend, Attack, Exploit", "Watch, Wait, Warn", "Build, Operate, Protect"], "answer": 1, "why": "The crest bears the words Defend, Attack, Exploit, which capture the branch's mission in three words." },
      { "q": "What does the crest look like?", "choices": ["Two crossed flags over a torch", "An eagle holding a telephone", "A satellite circling a globe", "A shield split in black and white beneath a raised dagger"], "answer": 3, "why": "The room describes the crest as a shield split in black and white beneath a raised dagger." },
      { "q": "Cyber training at Fort Gordon was brought together alongside which school?", "choices": ["The Signal School", "The Military Police School", "The flying school", "The Army Nurse Corps school"], "answer": 0, "why": "The Army consolidated its cyber, electronic warfare, and information operations training alongside the Signal School." },
      { "q": "Before Cyber, what was the last new Army branch to be created?", "choices": ["Infantry", "Aviation", "Special Forces", "Signal Corps"], "answer": 2, "why": "The room says Cyber was the first new branch created since Special Forces in 1987." },
      { "q": "In what year did the Cyber Center of Excellence begin standing up at Fort Gordon?", "choices": ["1860", "2014", "1941", "1987"], "answer": 1, "why": "Army Cyber Command and the Cyber Center of Excellence began standing up at Fort Gordon starting in 2014." }
    ]
  },
  "camp-gordon": {
    "type": "order",
    "title": "The First Camp Gordon",
    "intro": "Put the story of the World War I Camp Gordon in order, earliest first.",
    "items": [
      { "label": "Construction begins about 14 miles from Atlanta", "when": "June 18, 1917" },
      { "label": "The Army establishes the camp as the training camp for the 82d Division", "when": "July 18, 1917" },
      { "label": "The first drafted men report to camp", "when": "September 1917" },
      { "label": "The camp becomes an infantry replacement and training camp", "when": "April 1918" },
      { "label": "The camp becomes a demobilization center, sending soldiers home", "when": "December 3, 1918" },
      { "label": "The camp is abandoned", "when": "September 1921" }
    ]
  },
  "command-gallery": {
    "type": "quiz",
    "title": "Know Your Signal Units",
    "intro": "Test what you learned about the Signal Regiment's commands and featured units.",
    "questions": [
      { "q": "How many Signal Commands does the gallery show?", "choices": ["Two", "Four", "Six", "Twelve"], "answer": 2, "why": "The room says the six Signal Commands are the Army's largest communications formations." },
      { "q": "Where was the 1st Signal Brigade organized on April 1, 1966?", "choices": ["Vietnam", "France", "Georgia", "Alaska"], "answer": 0, "why": "The 1st Signal Brigade was organized in Vietnam on April 1, 1966." },
      { "q": "Where has the 1st Signal Brigade served since 1972?", "choices": ["Germany", "The Philippines", "Panama", "The Republic of Korea"], "answer": 3, "why": "The brigade has served in the Republic of Korea since 1972." },
      { "q": "Which phrase is the 501st Signal Battalion known by?", "choices": ["\"Hat in the Ring\"", "\"The Voice of the Eagle\"", "\"Secure Our Story\"", "\"Who said Rats!\""], "answer": 1, "why": "The 501st Signal Battalion is known as \"The Voice of the Eagle.\"" },
      { "q": "The 501st is the signal battalion of which division?", "choices": ["101st Airborne Division (Air Assault)", "4th Infantry Division", "10th Armored Division", "26th Infantry Division"], "answer": 0, "why": "The 501st is the signal battalion of the 101st Airborne Division (Air Assault)." },
      { "q": "At which post did the Army reactivate the 501st Signal Battalion in June 2026?", "choices": ["Fort Myer, Virginia", "Fort Monmouth, New Jersey", "Fort Campbell, Kentucky", "Fort Sam Houston, Texas"], "answer": 2, "why": "On 5 June 2026 the Army reactivated the 501st at Fort Campbell, Kentucky." },
      { "q": "In 2017 the 7th Signal Command (Theater) gave communications support for which three hurricanes?", "choices": ["Andrew, Hugo and Camille", "Katrina, Rita and Wilma", "Sandy, Irene and Matthew", "Harvey, Irma and Maria"], "answer": 3, "why": "A board in the collection shows the 7th Signal Command's 2017 hurricane support for Harvey, Irma, and Maria." }
    ]
  },
  "aviation": {
    "type": "match",
    "title": "Wings of the Signal Corps",
    "intro": "Match each early Army aviator to what he is remembered for.",
    "pairs": [
      { "left": "Lt. Thomas Selfridge", "right": "First person to die in a powered airplane crash, at Fort Myer in 1908" },
      { "left": "Lt. Frank Lahm", "right": "First Army officer to fly in an airplane, as a passenger in 1908" },
      { "left": "Lt. Frederic Humphreys", "right": "First Army officer to fly solo, on October 26, 1909" },
      { "left": "Benjamin Foulois", "right": "Taught himself to fly by mail with the Wrights at Fort Sam Houston" },
      { "left": "Hap Arnold", "right": "Set an Army altitude record of 4,764 feet at Augusta in 1912" },
      { "left": "Capt. Charles Chandler", "right": "Put in charge of the new Aeronautical Division in 1907" }
    ]
  },
  "hello-girls": {
    "type": "quiz",
    "title": "Number, Please!",
    "intro": "Answer these questions about the Signal Corps women known as the Hello Girls.",
    "questions": [
      { "q": "How many women did the Signal Corps send overseas as the Hello Girls?", "choices": ["23", "223", "2,230", "22,300"], "answer": 1, "why": "In 1918 the U.S. Army Signal Corps sent 223 women overseas." },
      { "q": "What job did the Hello Girls do?", "choices": ["Pilots", "Photographers", "Weather observers", "Telephone operators"], "answer": 3, "why": "They served as telephone operators, connecting the calls that moved orders along the front." },
      { "q": "To which country were they sent?", "choices": ["France", "Cuba", "Korea", "Mexico"], "answer": 0, "why": "The Signal Corps sent them to France to help win the First World War." },
      { "q": "Which two languages did the Hello Girls speak fluently?", "choices": ["English and Spanish", "English and German", "French and English", "French and Italian"], "answer": 2, "why": "They were fluent in French and English and trained on the Army's own switchboards." },
      { "q": "For about how long did their story stay almost entirely unknown?", "choices": ["A week", "A century", "A year", "A decade"], "answer": 1, "why": "The room says their story remained almost entirely unknown for a century." },
      { "q": "A 2023 bill in Congress would award the Hello Girls which honor?", "choices": ["The Congressional Gold Medal", "An Academy Award", "The Mackay Trophy", "A Military Aviator badge"], "answer": 0, "why": "S.815 is a bill to award the Congressional Gold Medal, collectively, to the Hello Girls." }
    ]
  },
  "combat-camera": {
    "type": "match",
    "title": "Lights, Camera, Signal Corps",
    "intro": "Match each film or cartoon to its description.",
    "pairs": [
      { "left": "Prelude to War", "right": "Frank Capra film that won the Academy Award for Best Documentary" },
      { "left": "Seeds of Destiny", "right": "Award-winning short that made the case for rebuilding war-torn Europe" },
      { "left": "Private Snafu", "right": "Cartoon Soldier who usually did the wrong thing so troops could learn from him" },
      { "left": "The Longest Day", "right": "D-Day epic that Darryl F. Zanuck released in 1962" },
      { "left": "Report from the Aleutians", "right": "First film in a War Department historical series" },
      { "left": "At the Front in North Africa", "right": "Film of amphibious landings in which nothing was staged" }
    ]
  },
  "fireside": {
    "type": "quiz",
    "title": "Stories by the Fire",
    "intro": "Answer these questions about the museum's Fireside Chats room.",
    "questions": [
      { "q": "What will you find in the Fireside Chats room?", "choices": ["Weather maps to read", "First-person recollections from Signaleers", "A flag signaling game", "Photographs of Navy ships"], "answer": 1, "why": "The room offers first-person recollections from the Signaleers who lived this history." },
      { "q": "Where in the museum are the fireside chat recordings playing?", "choices": ["The Weather Annex", "The Command Gallery", "The Auditorium", "The Satellite Annex"], "answer": 2, "why": "Fireside chats, panels, and Save Our Story interviews are playing in the Auditorium." },
      { "q": "Which of these belongs to the museum's oral history collection?", "choices": ["Save Our Story interviews", "Souvenir postcards", "Squadron emblems", "Sponsorship tiers"], "answer": 0, "why": "The oral history collection includes fireside chats, panels, and Save Our Story interviews." },
      { "q": "The Signal Corps History Interview is a conversation with whom?", "choices": ["Hollywood film directors", "Navy ship captains", "Weather forecasters", "U.S. Army Signal School leadership"], "answer": 3, "why": "It is a conversation with U.S. Army Signal School leadership, recorded for the museum's oral history collection." },
      { "q": "What is Heritage?", "choices": ["A Signal Corps airplane", "The museum's own magazine", "A communications satellite", "A training camp"], "answer": 1, "why": "Heritage is the museum's own magazine, chronicling Signal Corps history issue by issue." }
    ]
  },
  "donor-spotlight": {
    "type": "quiz",
    "title": "Climb the Campaign Circle",
    "intro": "Answer these questions about how the museum thanks its donors.",
    "questions": [
      { "q": "What are the levels of the Campaign Circle named for?", "choices": ["Signal Corps airplanes", "Georgia rivers", "Revolutionary War engagements", "Famous satellites"], "answer": 2, "why": "The Campaign Circle is a donor recognition ladder named for Revolutionary War engagements." },
      { "q": "Which level sits at the very top, for gifts of $1,000,000 or more?", "choices": ["Monmouth", "Lexington", "Boston", "Quebec"], "answer": 0, "why": "Monmouth is the top level, for gifts of $1,000,000 and up." },
      { "q": "What year is shown beside the Monmouth level?", "choices": ["1860", "1917", "1941", "1778"], "answer": 3, "why": "The ladder lists Monmouth with the year 1778." },
      { "q": "Which level is for gifts of $2,500 to $4,999?", "choices": ["Princeton", "Lexington", "Germantown", "Brandywine"], "answer": 1, "why": "Lexington is the level for gifts of $2,500 to $4,999." },
      { "q": "How does someone become a Signal Champion donor?", "choices": ["Give $1,000 at once or $200 a year for five years", "Visit the museum five times", "Give $10 a month for one year", "Write a story for the magazine"], "answer": 0, "why": "Champions give $1,000 at once or $200 a year for five years." },
      { "q": "What does the Campaign Circle recognize?", "choices": ["The fastest pilots", "The oldest Signal units", "The giving that keeps the museum open", "The best museum photographs"], "answer": 2, "why": "The Campaign Circle recognizes the giving that keeps this museum open." }
    ]
  },
  "people": {
    "type": "match",
    "title": "Who Does What?",
    "intro": "Match each part of the Honor Roll to what it is.",
    "pairs": [
      { "left": "Museum Staff", "right": "The Society's one full-time post, which keeps things moving between exhibits" },
      { "left": "Board of Directors", "right": "The volunteers who govern the Society" },
      { "left": "Council of Advisors", "right": "Bring the Signal Corps, cyber industry and Augusta community to the table" },
      { "left": "Distinguished Members", "right": "Members whose service or support shaped Signal and Cyber history" },
      { "left": "Hall of Fame", "right": "Inductees: Signal Corps veterans whose service shaped American film" }
    ]
  },
  "give": {
    "type": "quiz",
    "title": "Help Open the Doors",
    "intro": "Answer these questions about the campaign to bring the museum back.",
    "questions": [
      { "q": "When did the Signal Corps Museum on post close?", "choices": ["21 June 1860", "25 February 2021", "9 December 1941", "1 April 1966"], "answer": 1, "why": "The Signal Corps Museum on post closed on 25 February 2021, when base growth and construction took its building." },
      { "q": "Where has the museum's collection been since the building closed?", "choices": ["On tour around the country", "On display in the Auditorium", "In storage", "At a museum in France"], "answer": 2, "why": "The collection has been in storage ever since the museum closed." },
      { "q": "What is the Society raising money to do?", "choices": ["Buy a building just outside the gates and turn it into a museum", "Build a new airfield", "Launch a satellite", "Make a Hollywood film"], "answer": 0, "why": "The Society is raising funds to buy a building just outside the gates of Fort Eisenhower and turn it back into a museum." },
      { "q": "Once the building is secured, what comes next?", "choices": ["The exhibits", "The doors open", "A parade", "Renovation"], "answer": 3, "why": "Once the building is secured, renovation follows, then the exhibits, then the doors open to the public again." },
      { "q": "A Gettysburg Sponsor sponsors one of how many unit pages?", "choices": ["17", "172", "1,720", "72"], "answer": 1, "why": "A Gettysburg Sponsor sponsors one of 172 unit pages." },
      { "q": "Which of these is a way to help that needs no check?", "choices": ["Becoming a Normandy Ambassador", "Becoming a Champion", "Telling five people about the Society", "Becoming a Gettysburg Sponsor"], "answer": 2, "why": "The no-check ways to help are to tell five people, visit the website, and share your story." }
    ]
  },
  "timeline": {
    "type": "order",
    "title": "The Road So Far",
    "intro": "Put these steps in the museum Society's own story in order, earliest first.",
    "items": [
      { "label": "The Society's member group opens online with its mission", "when": "8 June 2020" },
      { "label": "The Society publishes its four-phase plan", "when": "August 2020" },
      { "label": "The first issue of Heritage magazine comes out", "when": "October 2020" },
      { "label": "The Signal Corps Museum closes and its colors are cased", "when": "25 February 2021" },
      { "label": "Fort Gordon is redesignated Fort Eisenhower", "when": "27 October 2023" },
      { "label": "The Society takes its present name, covering the Cyber Corps too", "when": "2024" }
    ]
  },
  "news": {
    "type": "quiz",
    "title": "Read All About It",
    "intro": "Answer these questions about the museum's news and its magazine.",
    "questions": [
      { "q": "What is Heritage?", "choices": ["The Society's magazine", "A television station", "A Navy ship", "A training film"], "answer": 0, "why": "Heritage, the Society's magazine, chronicles Signal Corps history issue by issue." },
      { "q": "Which cover is shown with the note \"Issue link coming soon\"?", "choices": ["Wings Over Augusta", "The Voice of the Eagle", "Flags and Torches", "Shaping Space Operations"], "answer": 3, "why": "The cover titled Shaping Space Operations is marked \"Issue link coming soon.\"" },
      { "q": "In the October 2023 report on the donation breakfast, about how much had been raised?", "choices": ["$5,000", "$500,000", "$50", "$50 million"], "answer": 1, "why": "The report says about $500,000 had been raised toward a building for the artifacts." },
      { "q": "According to the May 2021 news, where was the collection bound unless a local home was found?", "choices": ["Paris, France", "San Diego, California", "Anniston, Alabama", "Dayton, Ohio"], "answer": 2, "why": "The collection was bound for Anniston, Alabama, unless a local home was found." },
      { "q": "Who packed the collection, according to the Army.mil story?", "choices": ["The Center of Military History", "A Hollywood film crew", "The Weather Bureau", "The Navy"], "answer": 0, "why": "The Army.mil story tells how the Center of Military History packed the collection." },
      { "q": "A June 2022 story describes a fight to keep which items in the CSRA?", "choices": ["A balloon and a biplane", "A telegraph key and a torch", "A satellite and a rocket", "The Berlin Wall section and the Oscars"], "answer": 3, "why": "The story is about the fight to keep the Berlin Wall section and the Oscars in the CSRA." }
    ]
  },
  "magazine": {
    "type": "quiz",
    "title": "Turn the Pages",
    "intro": "Answer these questions about the Heritage magazine pages on view in this room.",
    "questions": [
      { "q": "What is Issue 2 (Spring 2021) of Heritage about?", "choices": ["The Wright brothers", "The Military Police School at Camp Gordon", "Weather forecasting", "Satellites in orbit"], "answer": 1, "why": "Issue 2 is titled The Military Police School at Camp Gordon." },
      { "q": "In what year did Camp Gordon become home to the Military Police School?", "choices": ["1917", "1898", "1948", "2021"], "answer": 2, "why": "After World War II, Camp Gordon became home to a disciplinary barracks and, in 1948, the Military Police School." },
      { "q": "What was the cover story of the Society's very first issue?", "choices": ["Academy Awards won by the Signal Corps", "The Hello Girls", "The first Army airplane", "Hurricane support in 2017"], "answer": 0, "why": "Volume 1, Issue 1 is titled Oscar: Academy Awards won by the Signal Corps." },
      { "q": "On the back cover of Issue 2, what is the MP sergeant riding near Saint-Lô, France, in 1944?", "choices": ["A horse", "A bicycle", "A tank", "A Harley-Davidson WLA"], "answer": 3, "why": "The back cover shows an MP sergeant on a Harley-Davidson WLA near Saint-Lô, France, 1944." },
      { "q": "Page 12 of Issue 2 shows a map of Fort Gordon in which year?", "choices": ["1860", "1956", "1918", "2003"], "answer": 1, "why": "Page 12 is a map of Fort Gordon in 1956." },
      { "q": "What is the name of the column on page 3 of Issue 2?", "choices": ["Supporter Guide", "Honor the Fallen", "Chairman's Corner", "Membership application"], "answer": 2, "why": "Page 3 is the Chairman's Corner." },
      { "q": "Which page of Issue 2 is blank in the original?", "choices": ["Page 16", "Page 2", "Page 10", "Page 20"], "answer": 0, "why": "The room notes that page 16 is blank in the original." }
    ]
  },
  "satellites": {
    "type": "order",
    "title": "Signals Into Space",
    "intro": "Put these space communications milestones in order, earliest first.",
    "items": [
      { "label": "Signal Corps engineers bounce a radar signal off the Moon in Project Diana", "when": "January 10, 1946" },
      { "label": "SCORE goes into orbit carrying President Eisenhower's Christmas greeting", "when": "December 18, 1958" },
      { "label": "Courier 1B, a 51-inch sphere covered in solar cells, is launched", "when": "October 4, 1960" },
      { "label": "Army satellite terminals help carry Apollo 11's communications home", "when": "July 1969" },
      { "label": "The Army creates the 1st Satellite Control Battalion", "when": "May 1, 1995" },
      { "label": "The first Wideband Global SATCOM satellite is launched", "when": "October 10, 2007" }
    ]
  },
  "fort-gordon": {
    "type": "match",
    "title": "Names on the Post",
    "intro": "Match each place at Fort Gordon to the story behind its name.",
    "pairs": [
      { "left": "Chibitty Hall", "right": "Comanche code talker who trained at Camp Gordon and landed at Utah Beach" },
      { "left": "Eisenhower Army Medical Center", "right": "Supreme Allied Commander in Europe and 34th President" },
      { "left": "Darling Hall", "right": "Signal officer killed in action in Vietnam at Fire Support Base Ripcord" },
      { "left": "Jimmie Dyess Parkway", "right": "Augusta Marine who led the assault on Roi-Namur in 1944" },
      { "left": "Topham Training Center", "right": "Sergeant who set up networks in the Middle East, then taught at Fort Gordon" },
      { "left": "Signal Towers", "right": "Ten-story landmark that once housed the Signal Corps Museum" }
    ]
  },
  "wireless": {
    "type": "order",
    "title": "Tune In the Years",
    "intro": "Put these moments in Army radio in order, earliest first.",
    "items": [
      { "label": "The Army's first wireless link joins Fire Island and its lightship", "when": "April 1899" },
      { "label": "Radio crosses 107 miles of Norton Sound between St. Michael and Nome", "when": "1904" },
      { "label": "Radio research moves to Camp Alfred Vail in New Jersey", "when": "Spring 1918" },
      { "label": "Signal Corps radar detects an airplane seven miles away at Newark", "when": "December 1936" },
      { "label": "Two privates at Opana see a large echo and are told to forget it", "when": "December 7, 1941" },
      { "label": "SINCGARS frequency-hopping radios begin reaching units in Korea", "when": "1988" }
    ]
  },
  "wired": {
    "type": "match",
    "title": "Who Ran the Line?",
    "intro": "Match each name or tool to its place in the story of Army wire.",
    "pairs": [
      { "left": "Billy Mitchell", "right": "Built the Eagle-to-Valdez telegraph line in Alaska, traveling by dog sled" },
      { "left": "Charles E. Kilbourne Jr.", "right": "Climbed a telegraph pole under fire in Manila to repair a broken wire" },
      { "left": "The buzzer", "right": "Sent Morse code through telephone receivers, even over bare wire" },
      { "left": "The EE-8", "right": "A field telephone of about ten pounds, standardized in 1932" },
      { "left": "Spiral-four", "right": "A cable that became standard in February 1942" },
      { "left": "The breast reel", "right": "Held about half a mile of light wire in the trenches" }
    ]
  }

};

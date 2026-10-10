// Part 3: The ads. The Meta ads playbook structure, rebuilt for a local
// service business, in Brandon's voice. No borrowed stats or claims.
export const pages = (page, divider) => {
  const P = 'The ads';
  const AD = ({ name = 'Your company', lead = '', img = 'Real photo of real work', photo = true, headline = '', desc = '', cta = 'Learn more', circle = false }) => `
    <div class="ad"><div class="top"><i></i><div><b>${name}</b><small>Sponsored</small></div></div>
    ${lead ? `<div class="copy">${lead}</div>` : ''}
    <div class="img ${photo ? 'photo' : ''} ${circle ? 'circle' : ''}">${photo ? '' : img}</div>
    <div class="link"><div><b>${headline}</b><small>${desc}</small></div><span>${cta}</span></div></div>`;

  return [
    divider(3, 'The ads.', 'How to write a Facebook or Instagram ad somebody stops for, and how to set the account up so a winner keeps winning.'),

    page({ part: P, kicker: '17 / The algorithm trap', title: 'Stop obsessing over the algorithm.', sub: 'The biggest mistake we see with owners running their own ads. They think the edge is in the settings.',
      body: `
        <p>They believe the win is in their targeting, their account structure, their bidding, and whatever "hack" some guy posted at 2am. Those guys are selling courses. They make it sound complicated on purpose, because the more confusing it sounds, the more the $1,997 price tag feels justified.</p>
        <div class="compare">
          <div class="bad"><b>Don't obsess over</b>Targeting. Lookalikes. Bid settings. The newest hack.</div>
          <div class="good"><b>Obsess over</b>People. What makes somebody stop scrolling, and what gets them to call.</div>
        </div>
        <p>Here's why. You can have the cleanest account setup on the planet running an ad that's flat, boring, and looks like every other roofer's ad, and it will get beat every time by a guy with a messy account and one ad that makes people stop.</p>
        <p class="big">The ad is the lever. Everything else is the fulcrum.</p>
        <p>Whatever you learn about the technical side today has a shelf life of about a year. The interface changes. The buttons get renamed. What makes a person stop and look at a picture of a roof doesn't change. Learn that, and you're set for as long as you own the business.</p>`,
      doNow: 'If you take one thing from this part, take that.' }),

    page({ part: P, kicker: '18 / How Meta picks ads', title: 'Your ad is your targeting now.', sub: 'Meta reads the ad itself to decide who sees it. That changes everything about how you write one.',
      body: `
        <p>Here's how it works, in plain words. Somebody opens Facebook or Instagram. Meta has tens of millions of ads in a pile. Its system sorts that pile in a fraction of a second and picks a short list that might fit this one person. Then it picks the winners off that short list.</p>
        <p>The part that matters to you: it reads your picture, your headline, your copy, and your offer, and matches all of that against what it knows about each person. The ad with a photo of a shingled roof and the words "roof replacement in Dallas" gets shown to people whose behavior looks like they're thinking about a roof.</p>
        <p>So the words and the picture you put in the ad are the audience signal you're sending. Whoever you describe in the ad is who Meta goes looking for.</p>
        <div class="callout dark">This is also why the list from Part 2 and a good ad work so well together. The list tells Meta who's looking. The ad tells Meta what they're looking for. You've stacked two signals that most advertisers don't have.</div>
        <p>It also means Meta rewards fresh variety. It can handle a lot of new ads without slowing down, and it gets tired of the same one fast. We'll come back to that.</p>`,
      doNow: 'Read your current ad. Who, exactly, does it describe? If the answer is "anybody," that is the problem.' }),

    page({ part: P, kicker: '19 / The two jobs', title: 'Every ad has two jobs.', sub: 'What people actually look at on these platforms is news and gossip. Not your logo. Not your mission statement.',
      body: `
        <p>Every year Meta publishes a report on the most-viewed content on the platform. It's the same thing every year. News, local updates, and gossip. That's what people are there for. Not your brand video.</p>
        <p>You might be thinking "I'm not turning my plumbing company into a tabloid." Fair. But don't hate the player, hate the game. We're not going to change what people want to look at. We're going to put your business in the stream that already exists.</p>
        <div class="cards c2">
          <div class="card"><span class="tag">Job 1</span><b>Give them something worth looking at</b><small>Real news, a real finding, something useful. "Here's what we found under 40 roofs in your neighborhood this summer." That's content. People stop for content.</small></div>
          <div class="card"><span class="tag">Job 2</span><b>Sell the click</b><small>Enough curiosity that more people click yours than the other guys' in the same auction. When that happens, Meta rewards you with cheaper placements and better people.</small></div>
        </div>
        <p>Notice what's not on the list. Selling the job. That happens on the page and on the phone. The ad's only job is to get the right person to stop and click.</p>`,
      note: 'Real means real. A finding you can back up. Never a fake news headline, a fake story, or a made-up review. It works for a week and then it costs you the account and the trust.',
      doNow: 'Write down three things you found on jobs this month that a customer would want to know.' }),

    page({ part: P, kicker: '20 / The ad skeleton', title: 'The anatomy of an ad that works.', sub: 'Every winning ad we run has the same bones. Learn them.',
      body: `
        <div class="anat">
          ${AD({ lead: 'Most people in {city} don\'t find out until the ceiling stain shows up. Here\'s what we look for first...', headline: 'The 3 things we check before we quote a roof', desc: 'Took us 10 years to get the list down to three', circle: false })}
          <div class="labels">
            <div><b>1. Scroll-stopping image</b>The pattern interrupt. The first thing the eye lands on. Real photo, something slightly off.</div>
            <div><b>2. Headline</b>Curiosity plus one specific benefit, in one line.</div>
            <div><b>3. Lead-in</b>The first one or two lines above "See more." The most overlooked part of the whole ad.</div>
            <div><b>4. Link description</b>The small text under the image. Most people leave it blank. It's free curiosity space.</div>
            <div><b>5. Body copy</b>The long part. Yes, long beats short, when it's interesting.</div>
            <div><b>6. Non-threatening button</b>"Learn more." Not "Book now." Not "Get a quote." We'll explain.</div>
          </div>
        </div>`,
      doNow: 'Pull up your best ad. Mark which of the six it has. Most have two.' }),

    page({ part: P, kicker: '20 / The ad skeleton', title: 'Three things, every time.', sub: 'Before an ad goes live, it answers yes to all three. Two out of three is average. One is dead on arrival.',
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>Does it stop the scroll?</b><small>Is there something in the picture that makes the brain go "wait, what's that?" for half a second? A real photo of a real problem does it. A stock photo of a guy in a polo doesn't.</small></div></div>
          <div class="step"><i>2</i><div><b>Does it open a question?</b><small>Is there something in the headline and the picture that a person can only answer by clicking? "The one thing every inspector misses" opens a question. "Quality roofing since 1998" doesn't.</small></div></div>
          <div class="step"><i>3</i><div><b>Does it promise one specific thing to one specific person?</b><small>Will the right person read it and think "that's me, I want that"? "Homeowners in {city}" plus "before the summer storms" plus a number does it.</small></div></div>
        </div>
        <h2>A word on "clickbait"</h2>
        <p>Most people hear clickbait and think it's a dirty word. Break it down. Bait for a click. That's exactly what Meta wants, people clicking and engaging. The opposite of clickbait is an ad nobody wants to click, and Meta punishes that with worse placements and higher costs.</p>
        <p>What you don't want is clickbait with no benefit. The wrong people click, and the algorithm has no idea who to find more of. You want the bait, and you want it aimed at your exact customer.</p>`,
      doNow: 'Score your current ads one to three. Rewrite anything under three.' }),

    page({ part: P, kicker: '21 / Headlines', title: "Don't write headlines from a blank page.", sub: "You don't need to be a copywriter. You need to pay attention to what already makes people stop.",
      body: `
        <p>Every headline that works on these platforms is a remix of a shape that already works. The local news page. The neighborhood Facebook group. The "you won't believe what this inspector found" post that your aunt shared. Read thirty of them, then write yours.</p>
        <h2>The levers</h2>
        <div class="cards c2">
          <div class="card"><b>Curiosity</b><small>The strongest one. Always pull it.</small></div>
          <div class="card"><b>Specific benefit</b><small>"Cuts your cooling bill about $40 a month," not "saves energy."</small></div>
          <div class="card"><b>Fear of loss</b><small>What it costs them to ignore this. A roof leak in month three costs more than the inspection in month one.</small></div>
          <div class="card"><b>Specificity</b><small>"3 things." "11 homes on your street." "$1,200." Numbers get believed. Vague gets ignored.</small></div>
          <div class="card"><b>Self-interest</b><small>Cooler house, cleaner truck, faster shipments, clearer skin. What they get, not what you do.</small></div>
          <div class="card"><b>Local</b><small>The city. The neighborhood. The storm last week. Local is the cheapest pattern interrupt there is.</small></div>
        </div>
        <div class="compare">
          <div class="bad"><b>Doubted</b>"We'll help you get more leads."<br>"Quality AC repair you can trust."</div>
          <div class="good"><b>Believed</b>"49 leads in 30 days at $17.70 each."<br>"The $90 AC fix that most techs in {city} skip."</div>
        </div>`,
      doNow: 'Write ten headlines for one service. Pick the two you would stop for.' }),

    page({ part: P, kicker: '21 / Headlines', title: 'Swipe the shape. Change the words.', sub: "You're not stealing. You're borrowing a structure that billions of views already proved.", ex: true,
      body: `
        <div class="rows">
          <div class="row"><b>Original</b><span>"Secret way to find out who called you without using Google"</span></div>
          <div class="row"><b>Adapted</b><span>"The way to find out what your roof is actually worth before the adjuster shows up"</span></div>
          <div class="row"><b>Original</b><span>"Nurse explains the three words most people say before they die"</span></div>
          <div class="row"><b>Adapted</b><span>"Mechanic explains the three sounds most people ignore before the transmission goes"</span></div>
          <div class="row"><b>Original</b><span>"Homeowners stunned after spotting detail on their water bill"</span></div>
          <div class="row"><b>Adapted</b><span>"{City} homeowners surprised by what's hiding in their attic insulation"</span></div>
        </div>
        <p>The shape does the work. The words make it yours and make it true. If you can't back the adapted line up with something real from your jobs, don't run it. Pick a different shape.</p>`,
      doNow: 'Save a folder of twenty headlines you stopped for. Add to it every week.' }),

    page({ part: P, kicker: '22 / Pattern interrupts', title: 'Win the scroll.', sub: 'The picture stops the thumb. The headline closes the deal. Half a second is all you need.',
      body: `
        <h2>Things that stop the scroll for a local business</h2>
        <ul>
          <li><strong>A raw phone photo</strong> from a job site. It doesn't look like an ad, so it doesn't get skipped like one.</li>
          <li><strong>The problem itself.</strong> The rusted water heater. The hail damage. The before, next to the after.</li>
          <li><strong>A red circle or an arrow</strong> drawn on a real photo pointing at one thing. Feels like somebody showing you a secret.</li>
          <li><strong>A text message screenshot.</strong> A real customer text (with permission) next to a photo of the job. The brain reads texts as one-to-one, not as advertising.</li>
          <li><strong>A face with a real expression.</strong> Your tech grimacing at what he found. Not a thumbs-up.</li>
          <li><strong>A map or a chart.</strong> A map of the 40 streets you worked on this year. Implies data. People trust data.</li>
          <li><strong>One bright thing</strong> in an otherwise plain frame. The copper pipe. The yellow tape measure.</li>
        </ul>
        <h2>Things that don't</h2>
        <ul>
          <li>Stock photos of smiling people in polos.</li>
          <li>Your logo. Your truck wrap by itself. A product on a white background.</li>
          <li>You, doing a thumbs-up.</li>
          <li>Anything that looks like an ad.</li>
        </ul>`,
      doNow: 'Go through your phone. Pull the ten ugliest, most real job photos you have. Those are your next ads.' }),

    page({ part: P, kicker: '22 / Pattern interrupts', title: 'Make the ad look like a post. Not an ad.', sub: "People have been trained for thirty years to skip ads. Don't fight it. Use it.",
      body: `
        <p>Before somebody can buy from you, they have to read. Before they read, they have to not skip. Everything about the ad should look like something a neighbor posted, not something a company paid for.</p>
        <h2>The burner account trick</h2>
        <p>If you don't know what "native" looks like in your niche, do this. Make a fresh Facebook or TikTok account. Follow the big pages in your trade, the local news, the neighborhood groups, and a few competitors. Spend twenty minutes liking and reading. Now every time you open that account, the algorithm shows you what's actually working in your market, sorted by what people engage with.</p>
        <p>That's your swipe file. Make your ads look like that.</p>
        <h2>Even better</h2>
        <p>If you've posted something in the last six months that got unusual engagement, a job photo, a before and after, a rant about a bad install you fixed, take it. Don't reinvent it. Put it in Ads Manager, write a headline and a lead-in, and run it. A post that already worked for free is the cheapest ad test there is.</p>`,
      doNow: 'Find your best organic post from the last six months. Turn it into an ad this week.' }),

    page({ part: P, kicker: '23 / Formats', title: 'Statics first. Video second.', sub: 'A quick word on pictures versus video before the formats.',
      body: `
        <p>In a perfect world you'd put out a new video every week. Most owners can't. Even with somebody helping, video is slow. Shoot it, edit it, redo it, and by the time it's done the season changed.</p>
        <p>A static image ad? You can make ten in an afternoon on your phone.</p>
        <p>And Meta's system is hungry. It needs fresh ads or the old ones wear out. Across the accounts we run, a handful of plain, native-looking image ads regularly do as well as or better than the polished video, at a fraction of the effort.</p>
        <p class="big">The takeaway isn't "video is dead." It's "don't let video be your bottleneck."</p>
        <p>Run both if you can. If you can only do one, do the images, all day. Ten to fifteen image ads per launch across the formats on the next pages and you'll never run dry.</p>
        <div class="callout">When you do shoot video, keep it to the phone. You, on a job, talking for 45 seconds about the one thing you found. No intro, no music, no logo animation. The same rule applies: it has to look like a post, not an ad.</div>`,
      doNow: 'Block two hours this week to make ten image ads from real job photos.' }),

    page({ part: P, kicker: '23 / Formats', title: 'Six formats we cycle through.', sub: 'Every account we run rotates these. Mix them. Meta gets bored of one.',
      body: `
        <div class="cards c2">
          <div class="card"><span class="tag">1 · The raw native</span><b>A phone photo that doesn't look like an ad</b><small>You and your crew on a job. Two or three people in frame reads as a social post. Meta serves it like content.</small></div>
          <div class="card"><span class="tag">2 · The text mockup</span><b>A screenshot of a customer text</b><small>"Hey, the AC's been running great since you came out, thank you" next to a photo of the unit. Real text, with permission. Reads as personal.</small></div>
          <div class="card"><span class="tag">3 · The local update</span><b>Looks like a neighborhood news post</b><small>"Heads up, {neighborhood}: here's what the hail did to 14 roofs on {street} last week." Real finding, real photos. The most reliable format we run. Keep it honest and keep it to a third of your mix.</small></div>
          <div class="card"><span class="tag">4 · The highlight</span><b>A real photo with a red circle or arrow</b><small>Pointing at the crack, the corrosion, the thing the last guy missed. Feels hand-drawn and urgent.</small></div>
          <div class="card"><span class="tag">5 · The social post</span><b>Main photo plus a small inset photo</b><small>The format every local news page uses. Before in the corner, after in the main frame. Headline underneath in plain words.</small></div>
          <div class="card"><span class="tag">6 · The reveal</span><b>A map, chart, or screenshot plus a teaser</b><small>"We mapped every job we did in {city} this year. One ZIP code had 3x the water heater failures." Data gets trusted.</small></div>
        </div>`,
      note: 'Format 3 is a real update about real work. Never a fake news headline or a made-up event. The honest version works, and you get to keep the account.',
      doNow: 'Make at least one ad in four of the six formats before your next launch.' }),

    page({ part: P, kicker: '24 / The lead-in', title: 'The two lines everybody wastes.', sub: 'The lead-in is the first one to three lines of copy, the part above "See more." It is the single most overlooked piece of the ad.',
      body: `
        <p>Most owners put a tagline there. Or "Attention homeowners!" Or they repeat the headline. All three say "this is an ad" and the thumb keeps moving.</p>
        <p>We've changed nothing else about an ad, same photo, same headline, same body, and watched the cost per lead move a lot by rewriting just these two lines.</p>
        <h2>What a good lead-in does</h2>
        <ul>
          <li>Continues the curiosity from the headline instead of restating it.</li>
          <li>Sounds like a person talking. "Most people don't find out until..."</li>
          <li>Introduces one specific, unexpected detail.</li>
          <li>Ends mid-thought, so they have to hit "See more."</li>
        </ul>
        <div class="compare">
          <div class="bad"><b>Bad lead-in</b>"Are you a homeowner in {city} who needs a new roof? Then you need to read this!"</div>
          <div class="good"><b>Good lead-in</b>"We pulled the shingles off 14 houses on {street} after the storm. Twelve of them had the same thing going on underneath, and it wasn't the hail...</div>
        </div>
        <p>The first one screams ad. The second one sounds like a post from a guy who was there, and it's specific.</p>`,
      doNow: 'Rewrite the first two lines of your best ad. Change nothing else. Run both for a week.' }),

    page({ part: P, kicker: '25 / Body copy', title: 'Long copy wins. When it is interesting.', sub: 'Long and boring is worse than short and boring. But long and interesting beats everything.',
      body: `
        <p>Write the best ad you can without thinking about length, then cut it hard. Meta allows about 2,200 characters where long copy shows. Use the room, but earn it.</p>
        <div class="rows">
          <div class="row"><b>Rule 1</b><span><strong>Write like you talk to a customer in the driveway.</strong> Fifth-grade reading level. Short words. If you wouldn't say it out loud, don't type it.</span></div>
          <div class="row"><b>Rule 2</b><span><strong>Short sentences. Short paragraphs.</strong> One or two lines each. People will tell you it breaks the rules from English class. Ignore them. White space gets read.</span></div>
          <div class="row"><b>Rule 3</b><span><strong>Write to one person.</strong> Not "our customers." You. Not "{Business} offers." We do.</span></div>
          <div class="row"><b>Rule 4</b><span><strong>Go easy on "you" and "your."</strong> Meta's filters don't love ads that call out personal attributes. "People who..." and "anyone with a..." work just as well.</span></div>
          <div class="row"><b>Rule 5</b><span><strong>Lead with what's in it for them.</strong> If they can't see it in the first line, they're gone.</span></div>
          <div class="row"><b>Rule 6</b><span><strong>Positive beats negative, most of the time.</strong> "Keep the house at 72 all summer for about $40 a month less" beats "Don't let your AC die this summer." Test both. Default to the positive.</span></div>
        </div>`,
      doNow: 'Paste your ad into a readability checker. If it reads above eighth grade, cut it.' }),

    page({ part: P, kicker: '25 / Body copy', title: 'Specific is believable. Believable gets clicked.', sub: 'And there is a second reason long copy works that most people never hear.',
      body: `
        <div class="rows">
          <div class="row"><b>Rule 7</b><span><strong>Add real numbers, real names, real timeframes.</strong> "A roofer in {city} went from 2 roofs a month to 8" is a sentence people believe. "We help roofers grow" is noise. Show some personality. Your reader is sick of corporate-speak.</span></div>
          <div class="row"><b>Rule 8</b><span><strong>One ad, one angle.</strong> Once you've got a headline that works, the picture, the lead-in, the body, and the button all serve that one idea. Don't try to say five things.</span></div>
          <div class="row"><b>Rule 9</b><span><strong>Long copy is targeting fuel.</strong> Meta reads the copy to decide who sees it. Short copy gives it almost nothing to go on. Long, specific copy, "homeowners in {neighborhood} with a 15-year-old unit," tells it exactly who to find.</span></div>
        </div>
        <div class="compare">
          <div class="bad"><b>Short copy</b>Small signal. Small pool of people. Meta is guessing.</div>
          <div class="good"><b>Long, specific copy</b>Big signal. Big pool of the right people. Meta knows who you want.</div>
        </div>
        <p>This is why "short and punchy" loses to "long and interesting" on Meta. Not only because long copy sells better. Because short copy starves the system of the information it needs to find your customer.</p>`,
      doNow: 'Add three specific details to your ad body. A number, a street, a timeframe.' }),

    page({ part: P, kicker: '26 / The button', title: '"Learn more." That\'s the button.', sub: 'Not "Book now." Not "Get a quote." Not "Call now." Learn more.',
      body: `
        <p>Here's why. The whole ad up to this point has been selling the click, not the job. Then you put a high-pressure button on the end of it and it contradicts everything above it. The person was reading a post, and now it's a sales pitch.</p>
        <p>"Learn more" is non-threatening. It promises information, not a commitment. It gets the click. And the click is the only thing the ad is for.</p>
        <p class="big">You sell on the page and on the phone. Not in the ad.</p>
        <div class="callout">One exception for a local business. If the campaign's whole job is phone calls from people with an emergency right now, a call button can be the right move. Test it against "Learn more" to a page with a big phone number on it. Let the cost per booked job decide, not the cost per click.</div>`,
      doNow: 'Switch your prospecting ads to "Learn more." Watch the cost per lead for a week.' }),

    page({ part: P, kicker: '27 / One-word targeting', title: 'Change one word. Open a new pocket of customers.', sub: 'Since the ad is the targeting, you put the targeting in the ad.', ex: true,
      body: `
        <p>Take your best ad. Look at the customers who make up most of your revenue. What kind of property, what part of town, what kind of business? Now duplicate the ad and swap one word in the headline or the lead-in.</p>
        <div class="compare">
          <div class="bad"><b>Generic</b>"Here's what we found under 40 roofs this summer."</div>
          <div class="good"><b>One word swapped</b>"Here's what we found under 40 roofs in {Westside} this summer."<br><br>"...under 40 roofs on 1990s builds..."<br><br>"...under 40 roofs on rental properties..."</div>
        </div>
        <p>Same offer. Same photo. One word. Meta reads "rental properties" and goes looking for landlords. You just reached a group the generic ad was never going to find.</p>
        <p>Same idea for the picture. If your med spa does well with women in their fifties and also women in their thirties, don't narrow the age in the settings. Run one ad with each in the photo. Meta reads the age off the picture and the copy.</p>`,
      doNow: 'Duplicate your best ad. Swap one word. Change nothing else. Launch. Check in 48 hours.' }),

    page({ part: P, kicker: '28 / More ads from one winner', title: 'A winner is a seed. Not a finish line.', sub: 'Most people find one ad that works, turn everything else off, and ride it until it dies. Then they panic and start over.',
      body: `
        <p>Don't do that. Once you've got a winner, that's the DNA. Make more of it.</p>
        <h2>The workflow</h2>
        <div class="steps">
          <div class="step"><i>1</i><div><b>Feed the winning ad to an AI tool</b><small>The Demand Intelligence software does this for you. Any AI tool works. Just do it.</small></div></div>
          <div class="step"><i>2</i><div><b>Give it the brief</b><small>"Read this ad. You wrote it. Write the next one in the same voice. If we showed 100 people both ads, not one should be able to tell they're by different people."</small></div></div>
          <div class="step"><i>3</i><div><b>Ask for variants by customer</b><small>"Rewrite for a landlord." "Rewrite for a first-time homebuyer." "Rewrite for a fleet manager." The bones stay. The person changes.</small></div></div>
          <div class="step"><i>4</i><div><b>Body copy first, then headlines, then photo ideas</b><small>Twenty to fifty versions. Push them all into one campaign and let Meta pick.</small></div></div>
        </div>
        <h2>The zombie campaign</h2>
        <p>Meta will spend on five or ten of them and leave the rest at zero. Don't delete the zeros. Take the ones you still believe in and put them in their own ad set. Meta's first pick isn't always right, and a good ad sometimes never gets an at-bat in a crowded campaign. Give it one. You'll usually find a couple more winners in that batch.</p>`,
      doNow: 'Take your best ad from the last 30 days. Generate 20 variants this week. Launch them together.' }),

    page({ part: P, kicker: '29 / The page', title: 'Match the ad to the page.', sub: 'Most owners spend all their effort on the ad and none on where it goes. That is backwards.',
      body: `
        <p>The ad sold a click on one specific promise. The page has to deliver that same promise inside half a second. The headline on the page and the headline on the ad should match, word for word or close to it. Break that trail and you lose half the clicks before they read anything.</p>
        <h2>The scent test</h2>
        <div class="steps">
          <div class="step"><i>1</i><div><b>Open your top three ads. Click them like a customer would.</b></div></div>
          <div class="step"><i>2</i><div><b>Read the first line on the page.</b></div></div>
          <div class="step"><i>3</i><div><b>Same words? Same promise? Same picture? If not, fix it today.</b></div></div>
        </div>
        <h2>Meta is the cheapest split test you'll ever get</h2>
        <p>Testing a headline on your website takes thousands of visitors to mean anything. On Meta, a headline gets tens of thousands of views for pocket change. So run twenty headline variants on the ads. Let Meta find the winner. Then put the winning headline on the page, the top of the form, and the first line of your follow-up text. The page converts better because the ad already proved the words.</p>
        <div class="callout">Keep at least one test running at all times. Owners will haggle a vendor for $40 a month and then go to bed with zero tests running on the biggest line item they have, which is what it costs to get a customer.</div>`,
      doNow: 'Fix every page whose headline doesn\'t match its ad. Then set a Monday reminder: "Is a test running?"' }),

    page({ part: P, kicker: '30 / Account structure', title: 'Structure only matters after you have a winner.', sub: "If the ad is bad, no setup on earth saves it. You can't structure your way out of a boring ad.",
      body: `
        <p>So if you skipped straight here looking for the setup hack, go back. Read the ad pages. Do them. Then come back.</p>
        <p class="big">The ad is the signal. The account is the amplifier. A weak signal through a great amplifier is still weak.</p>
        <p>But once you've got an ad that stops thumbs and gets clicks, the structure matters a lot. The right setup can squeeze noticeably more out of the exact same ad, stop you wasting money on bad days, and let you turn the budget up without the whole thing falling apart.</p>
        <h2>Two campaigns. That's it.</h2>
        <div class="cards c2">
          <div class="card"><span class="tag">Launch</span><b>Where every new ad goes first</b><small>Purpose: test. One ad set per 10 to 20 ads. Mix the formats, don't group them. Campaign budget, with a cost cap. The campaign sorts winners from losers.</small></div>
          <div class="card"><span class="tag">Scale</span><b>Where the winners get amplified</b><small>Purpose: squeeze every lead out of what works. Winners get copied here. One ad set per landing page or offer. Campaign budget, cost cap, bigger ceiling.</small></div>
        </div>
        <p class="note">No more "prospecting vs retargeting." No more interest-stack campaigns. One service or offer, two campaigns.</p>`,
      doNow: 'Draw your account on paper. If there are more than two campaigns per offer, ask why.' }),

    page({ part: P, kicker: '30 / Account structure', title: 'The settings that apply to everything.', sub: 'Set these once on both campaigns and stop fiddling.',
      body: `
        <div class="rows">
          <div class="row"><b>Goal</b><span><strong>Leads.</strong> A form fill or a call, tracked. Not clicks, not "engagement," not video views. You can't pay a crew with video views.</span></div>
          <div class="row"><b>Audience</b><span><strong>Broad, inside your service area.</strong> Advantage+ audience. No interest stacks, no lookalikes. Your real service radius is the only line you draw. The ad does the rest of the targeting. When you have the Part 2 list, upload it as a custom audience and run it alongside broad.</span></div>
          <div class="row"><b>Age and gender</b><span><strong>Everybody.</strong> Even if your customer is "women 40 plus," launch broad. Narrowing handicaps the system before it learns. Put the 45-year-old in the photo instead. Only narrow if, after two weeks of real spend, the budget is clearly going to a group that never converts.</span></div>
          <div class="row"><b>Exclusions</b><span><strong>Your existing customers, two ways.</strong> The pixel audience catches some. The customer list uploaded from your CRM catches the rest. Set up both. Otherwise you're paying to show ads to people who already paid you, and counting their next job as "ad-driven."</span></div>
          <div class="row"><b>Placements</b><span><strong>Advantage+ placements.</strong> Let Meta serve it everywhere. Don't hand-pick.</span></div>
          <div class="row"><b>Attribution</b><span><strong>7-day click, 1-day engaged view.</strong> Not 1-day view. Most "view" conversions are people who were going to call anyway. Your reported numbers will look worse the day you switch. They aren't worse. They're honest.</span></div>
        </div>`,
      doNow: 'Open each ad set. Check all six. Fix what does not match.' }),

    page({ part: P, kicker: '30 / Account structure', title: 'Bids and budgets.', sub: 'This is the part most people get wrong, because it feels backwards.',
      body: `
        <h2>Cost cap, not highest volume</h2>
        <p>Meta's default is "highest volume." That means it spends your whole daily budget no matter how the day is going. Bad day? Spends it anyway. Great day? Hits the ceiling and stops.</p>
        <p>We run a cost cap instead. You tell Meta "only spend if you can get me a lead for about this much." Then it spends less on bad days and more on good days, and only on the ads that are hitting the number.</p>
        <p>What number? The one from your numbers worksheet. The most you can pay for a lead and still make money on the job. Set it there. If it won't spend after a few days, nudge it up 10 to 20 percent. If it overspends and the leads are junk, nudge it down. You're not lying to the system. You're calibrating it.</p>
        <h2>Set the budget higher than you'll spend</h2>
        <p>With a cost cap, the daily budget is a ceiling, not a target. Meta only spends up to it if it can hit your cost. So set the ceiling at about twice what you expect to spend. That gives it room to go hard on the good days, when the right people are online and the leads are cheap. A tight budget caps your best days.</p>
        <div class="callout">Brand new campaign? Start with a low budget for the first three to five days and make sure the cost cap is actually working. Then raise the ceiling.</div>
        <p class="note">Judge a cost cap on a 7 to 14 day average, not day to day. Meta credits a lead to the day it came in, not the day the ad was seen. Monday's spend becomes Wednesday's leads.</p>`,
      doNow: 'Set the cost cap at your real max cost per lead. Set the budget at 2x expected spend.' }),

    page({ part: P, kicker: '30 / Account structure', title: 'Retarget with a different reason. Not more pressure.', sub: 'For a local business with a real sales cycle, retargeting pays. Done the usual way, it just annoys people.',
      body: `
        <div class="compare">
          <div class="bad"><b>The wrong way</b>Same ad they already saw. Shown again. With a discount on it. Hammered for 30 days. They already said no, and you're saying it louder and cheaper.</div>
          <div class="good"><b>The right way</b>Ask why they didn't call. There are usually three reasons. Build one campaign for each.</div>
        </div>
        <div class="cards c3">
          <div class="card"><span class="tag">A · Objections</span><b>Answer the real reasons</b><small>"I've been burned by a contractor before." "I don't want a pushy salesman in my house." "Is this going to cost more than they said?" One ad per objection, answered straight.</small></div>
          <div class="card"><span class="tag">B · Proof</span><b>Real customers, real results</b><small>A carousel of reviews and before-and-afters. Match the proof to the person. Landlords see landlord jobs.</small></div>
          <div class="card"><span class="tag">C · Different offer</span><b>A smaller next step</b><small>The person who didn't book the full replacement might book the $90 inspection. Different price, different angle.</small></div>
        </div>
        <p>Build the audiences first: people who hit your page or engaged with your posts in the last 30 and 180 days. Exclude customers. Then run objections first, proof second, the smaller offer third.</p>`,
      note: 'Skip all of this for a low-ticket, one-visit service. Broad targeting now retargets better than you can by hand for those. Retargeting earns its keep when a job is worth real money and people take a while to decide.',
      doNow: 'Write down the three reasons people don\'t book with you. Those are your three retargeting ads.' }),

    page({ part: P, kicker: '30 / Account structure', title: 'The launch checklist.', sub: 'Every time a new round of ads goes out, run this.',
      body: `
        <div class="checkhead"><span>Before you launch</span><span></span><span></span><span>Done</span></div>
        <div class="check"><div>10 to 20 new ads across at least four formats</div><span></span><span></span><i></i></div>
        <div class="check"><div>Every ad passes all three: stops the scroll, opens a question, promises one specific thing</div><span></span><span></span><i></i></div>
        <div class="check"><div>Headlines borrowed from a shape that already works, and true</div><span></span><span></span><i></i></div>
        <div class="check"><div>Lead-in continues the headline and ends mid-thought. Not a tagline.</div><span></span><span></span><i></i></div>
        <div class="check"><div>Body copy under 2,200 characters, reads like a driveway conversation</div><span></span><span></span><i></i></div>
        <div class="check"><div>"Learn more" button</div><span></span><span></span><i></i></div>
        <div class="check"><div>Page headline matches the ad headline</div><span></span><span></span><i></i></div>
        <div class="check"><div>Launched in Launch, not Scale</div><span></span><span></span><i></i></div>
        <div class="check"><div>Broad audience inside the service area. Customer list excluded, both ways.</div><span></span><span></span><i></i></div>
        <div class="check"><div>7-day click, 1-day engaged view attribution</div><span></span><span></span><i></i></div>
        <div class="check"><div>Cost cap set at your real max cost per lead</div><span></span><span></span><i></i></div>
        <div class="check"><div>Low budget for the first 3 to 5 days</div><span></span><span></span><i></i></div>
        <div class="check"><div>Every lead routes to a phone and a person inside 5 minutes</div><span></span><span></span><i></i></div>`,
      doNow: 'Print this page. Tape it next to the computer.' }),

    page({ part: P, kicker: '30 / Account structure', title: 'When an ad wins. When an ad dies.', sub: 'A winner is any ad Meta chooses to put real budget on. Not the one with the best click rate. The platform sees signals you don\'t.',
      body: `
        <h2>When it wins</h2>
        <ul>
          <li>Leave the original on in Launch. Don't pause it. The learning is tied to that ad.</li>
          <li>Copy it into every ad set in Scale, one per page or offer.</li>
          <li>Feed it to the variant workflow. Twenty to fifty versions back into Launch.</li>
          <li>Clone it with the one-word swap. Neighborhood, property type, customer type.</li>
          <li>Raise the Scale budget ceiling to 2x expected spend. Wait a week before you touch the cost cap.</li>
        </ul>
        <h2>Before you kill one that's slowing down, ask three questions</h2>
        <div class="steps">
          <div class="step"><i>1</i><div><b>Is it the reporting lag?</b><small>Leads get credited to the day they came in. Wait three more days.</small></div></div>
          <div class="step"><i>2</i><div><b>Is everything slowing down?</b><small>Then it's the season, the costs, or the page. Fix that, not the ad.</small></div></div>
          <div class="step"><i>3</i><div><b>Is it worn out?</b><small>Frequency over 3? Don't kill it. Run it through the variant workflow and ship 20 fresh versions before it dies. The idea still works. The surface needs to change.</small></div></div>
        </div>
        <p class="note">Killing a winning ad after two bad days is one of the most expensive mistakes we see. Look at the 7-day number. Most "dead" ads come back by day five.</p>`,
      doNow: 'Check frequency on your top ad. If it is over 3, start the variants today.' }),

    page({ part: P, kicker: '30 / Account structure', title: 'Track the number that pays the crew.', sub: 'This is what separates people who run ads from people who run a business.',
      body: `
        <p>Meta's dashboard shows you a number. Your bank account shows you a different number. Both are true. If you're optimizing for the dashboard, you can optimize yourself right out of business.</p>
        <div class="cards c3">
          <div class="card"><b>Cost per paid job</b><small>Not cost per lead. Not cost per click. Total spend across every channel, divided by jobs that finished and paid. From your job records, not the ad platform.</small></div>
          <div class="card"><b>Net cash, 30 days</b><small>What went in. What came back after materials, labor, refunds, and fees. That gap, over a month. It's the only number that pays rent.</small></div>
          <div class="card"><b>Max you can pay per customer</b><small>Sit down with your real margins. Figure out the most you can spend to get a customer and still hit your profit. Aim at that, not the cost per lead you got comfortable with two years ago.</small></div>
        </div>
        <h2>The trap</h2>
        <p>"I tried spending more and the cost per lead went up." Right. That's how scaling works. The question isn't whether the cost per lead went up. It's whether more cash hit the bank this month. Going from $3,000 a month in ads to $9,000 at a higher cost per lead is usually the right call if the jobs went from 12 to 30. Pay the crew with the difference.</p>
        <div class="callout dark">Numbers day. Block three hours, same day every month. You, the job records, and the bank account. No media buyer, no report. It's not the fun thing on the calendar. It moves the money more than anything else on it.</div>`,
      doNow: 'Put a recurring three-hour "Numbers day" on the first Friday of every month.' }),

    page({ part: P, kicker: '30 / Account structure', title: 'The most common mistakes.', sub: 'We see every one of these in accounts that come to us. Check yours.',
      body: `
        <ul>
          <li><strong>Obsessing over settings instead of the ad.</strong> Backwards. Fix the ad first.</li>
          <li><strong>Ads that look like ads.</strong> Logo, brand colors, stock photo. Dead on arrival.</li>
          <li><strong>"Book now" buttons on cold traffic.</strong> Pressure breaks the flow. Learn more.</li>
          <li><strong>Not excluding your customer list.</strong> You're paying to advertise to people who already paid you.</li>
          <li><strong>1-day view attribution.</strong> Fluff in the report. Every decision after it is off.</li>
          <li><strong>Narrowing the audience by hand.</strong> Let it run broad inside your area. Put the targeting in the ad.</li>
          <li><strong>Budget equal to expected spend.</strong> Caps your best days. Set the ceiling at 2x.</li>
          <li><strong>Killing winners after two bad days.</strong> Look at seven. Make variants before you kill anything.</li>
          <li><strong>Treating long copy as the enemy.</strong> Long and interesting wins, and it feeds the targeting.</li>
          <li><strong>Riding one winner until it dies.</strong> Clone it. Swap words. Make variants. Dozens of ads from one.</li>
          <li><strong>Optimizing for the dashboard instead of the bank.</strong> Cost per paid job and net cash grow a business. Cost per lead grows a screenshot.</li>
          <li><strong>Running ads to a phone nobody answers.</strong> The most expensive one on this list. Five minutes. Every lead. Or don't run the ads.</li>
        </ul>
        <p>The tactics on these pages will change. Buttons get renamed, settings move. The principles don't. The ad is the lever. The ad is the targeting. People stop for real things. Net cash is the only number that pays anybody.</p>`,
      doNow: 'Count how many of the twelve you are doing right now. Fix the top one this week.' }),
  ];
};

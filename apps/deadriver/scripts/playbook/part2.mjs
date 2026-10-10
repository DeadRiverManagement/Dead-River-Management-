// Part 2: The people already looking. Demand Intelligence in plain words.
// Figures confirmed by Brandon: 280M U.S. consumer profiles, 60B weekly behaviors, 95% contact accuracy, updated daily.
export const pages = (page, divider, F) => {
  const P = 'The people already looking';
  return [
    divider(2, 'The people already looking.', 'Stop showing your ad to everybody. Show it to the ones who are searching for you right now.', F.img.g['map-signals']),

    page({ part: P, kicker: '15 / Buying signals', title: 'Most ads go to the wrong people.', sub: 'That is the whole problem with "ads don\'t work for my business."',
      body: `
        ${F.pic('spaghetti', 'Most advertising. A little of this, a little of that, and one strand sticks.', 'max-width:420px')}
        <p class="big">Here's what I'd tell you on a call. We're a marketing agency, but we're a little bit different, because we start with who's looking, not with the ad.</p>
        <p>Most agencies pick an audience by checking boxes. Homeowners, 35 to 65, within 25 miles. Or "small business owners." Then they put an ad in front of all of them and hope the one person who needs you this week is scrolling. That's throwing spaghetti at the wall and seeing what sticks. You pay for every throw.</p>
        <p>What we do instead is look at what people are actually looking up. Somebody in your market has been reading about water heater prices for two days. Somebody else just compared three dentists. Those are buying signals. They're what a person does right before they buy.</p>`,
      note: 'A buying signal means somebody recently looked up a topic, product, or service like yours. It does not mean they are certain to buy, or that they will buy today. It means they are a lot closer than a random name in an audience.',
      doNow: 'Write down the five things a customer looks up right before they buy from you.' }),

    page({ part: P, kicker: '15 / Buying signals', title: 'Where your customers are.', sub: 'An old sales rule, and it still holds. In any market, the buyers break down about like this.', ex: true,
      body: `
        ${F.pic('pyramid', 'Top to bottom: 3% buying now · 17% gathering information · 20% know they have the problem · 60% don\'t know yet', 'max-width:420px')}
        <p>Most advertisers fight over the 3%. Everybody's bidding on "emergency plumber near me" or "buy running shoes." It's expensive, and you're one of eight businesses on the same search.</p>
        <p>The 17% and the 20% are where the money is. They're reading, comparing, asking a friend. Nobody's talking to them yet. Buying signals tell you who they are, so you can get in front of them with something useful before they ever type "near me" or "best."</p>
        <p class="big">You're not just hunting the 3%. You're farming the 97%. With a list, not a guess.</p>`,
      note: 'The percentages are a rule of thumb from an old sales book, not a measurement of your market. The shape is what matters.',
      doNow: 'Look at your last ten customers. How many were in a hurry, and how many had been thinking about it for weeks?' }),

    page({ part: P, kicker: '16 / Build the list', title: 'Build your list.', sub: 'Four steps. You can do this yourself with the software, or we do it for you.',
      body: `
        ${F.fig(F.mapFig(), 'Demand Intelligence · recent search activity, by area')}
        <div class="steps">
          <div class="step"><i>1</i><div><b>Pick the topics</b><small>What people look up before they buy from you. "Roof replacement cost." "Botox near me." "Freight broker for LTL." "Best running shoes for flat feet." Be specific.</small></div></div>
          <div class="step"><i>2</i><div><b>Pick the area and the window</b><small>Your real market, whether that's a ZIP code or the whole country. Then how recent: the last two days for hot, the last seven for warm.</small></div></div>
          <div class="step"><i>3</i><div><b>Add the filters that matter</b><small>Homeowner or renter. Business size. Income range. Whatever actually changes whether they're a fit for you.</small></div></div>
          <div class="step"><i>4</i><div><b>Pull the list</b><small>Names, contact details, and what they were looking at. Contact details come back about 95% accurate.</small></div></div>
        </div>
        <p class="note">The list changes every day, because people start looking and stop looking every day. Pull it fresh each week at least. The person researching roofers two weeks ago has probably hired somebody by now.</p>`,
      doNow: 'Write your three topics, your area, and your window.' }),

    page({ part: P, kicker: '16 / Build the list', title: 'Put the list to work.', sub: 'A list is worth nothing in a spreadsheet. Three ways we use it.',
      body: `
        ${F.shot(F.img.diDemo, 'Live pull · Dallas roofing, 4,500 people shopping in the last seven days', 'max-width:430px')}
        <div class="cards c3">
          <div class="card"><b>Ads</b><small>Upload the list to Meta and Google as a custom audience. Your ads only show to people who are already looking. Same budget, a lot more calls. Part 3 is how to write the ad.</small></div>
          <div class="card"><b>Email</b><small>A short, plain email to the people on the list. Not a newsletter. One useful thing, one next step. The software writes it in your voice, and you approve it.</small></div>
          <div class="card"><b>Calls and texts</b><small>For higher-ticket work. A quick "Hey, is this {first name}?" then a real conversation. Permission rules apply, and you follow them.</small></div>
        </div>
        <p>What it looks like for a client: a Dallas roofer wants replacement jobs, not patches. We pull everybody in his area who looked up roof replacement in the last seven days. His ads run only to that list. The email goes to the ones with an address on file. His office calls the five hottest each morning. Every lead gets a call back inside five minutes, logged in the CRM. That's the whole Demand Flow system.</p>`,
      note: 'Follow the rules for texting and calling in your state. Use the list for people who are a fit for what you actually sell. Buying signals are not a promise that any one person will buy.',
      doNow: 'Pick one of the three. Run it for one product or service for two weeks.' }),

    page({ part: P, kicker: '16 / Build the list', title: 'See who is already on your site.', sub: 'Most of the people who visit your website never call or buy. Now you can know who they were.',
      body: `
        ${F.shot(F.img.diFrame, 'Matched visitors and the companies they came from', 'max-width:430px')}
        <p>Demand Intelligence can match the people visiting your website to real profiles. Somebody reads your pricing page at 9pm and leaves. The next morning, they're on your list with a name and contact details.</p>
        <div class="steps">
          <div class="step"><i>1</i><div><b>Add the tag to your site</b><small>One snippet of code. Whoever manages your website can do it in ten minutes.</small></div></div>
          <div class="step"><i>2</i><div><b>Watch who shows up</b><small>Which page they read, how long they stayed, and whether they came back.</small></div></div>
          <div class="step"><i>3</i><div><b>Follow up like a person</b><small>A short email or a retargeting ad about the thing they read. Not "we noticed you visited our site." Just the useful next step.</small></div></div>
        </div>
        <p class="note">Put this together with the list from the last page and you've got two groups: people looking around your market, and people who already looked at you. Both are a lot warmer than a cold audience.</p>`,
      doNow: 'Count last month\'s website visitors. Then count the calls or orders. The gap is the opportunity.' }),
  ];
};

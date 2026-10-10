// Part 3, Google section: the people typing it in. Rebuilt from the original
// playbook's Google Ads pages for any business, in Brandon's voice.
export const pages = (page, divider, F) => {
  const P = 'The ads';
  return [
    page({ part: P, kicker: '31 / Google', title: 'Meta finds them. Google catches them.', sub: 'Two channels, two different jobs. Most owners pick one and wonder why the other guy is getting the calls.',
      body: `
        <div class="compare">
          <div class="good"><b>Meta</b>They see something useful while scrolling. You reach the 97% who are thinking about it but haven't typed anything yet. The Part 2 list and the Part 3 ads live here.</div>
          <div class="bad" style="background:var(--charcoal);color:var(--cream)"><b style="color:var(--copper)">Google</b>They typed it in. "Water heater replacement near me." "Invisalign cost." "LTL freight broker Dallas." These people are the 3%, ready now, and you want to be there when they look.</div>
        </div>
        <p>Google is the one you run first if you can only afford one and the phone has to ring this month. Somebody searching "emergency plumber" at 10pm is not browsing. They're hiring. Meta is the one that builds the pipeline for next month.</p>
        <p>Keep the same goal in both: a finished job or a paid order you can make money on. Not clicks. Not "impressions." A click on the phone number is not a completed call, and a form fill is not a customer. Run both channels through to the paid job in your records before you decide which one works.</p>
        <div class="callout">Where Demand Intelligence fits on Google: upload your buying-signal list as a customer match audience, then bid higher when a search comes from somebody on it. Same words, warmer person.</div>`,
      doNow: 'Choose one service or product, one area, and a budget you can afford to lose while you learn.' }),

    page({ part: P, kicker: '31 / Google', title: 'Start with the job.', sub: 'Not with the keyword. Pick work you can do well and make money on. Then find the searches that mean somebody needs it.', ex: true,
      body: `
        ${F.fig(F.flow([['The work', 'drain clearing'], ['The search', '"drain clearing near me"'], ['The ad', 'Drain clearing in {city}'], ['The page', 'the drain page, with a form']], { last: true, h: 90 }))}
        <div class="rows">
          <div class="row"><b>Roofing</b><span>"roof replacement cost {city}", "hail damage roof inspection"</span></div>
          <div class="row"><b>Med spa</b><span>"botox near me", "laser hair removal {city} price"</span></div>
          <div class="row"><b>Freight</b><span>"LTL freight broker", "ship a pallet from Dallas to Houston"</span></div>
          <div class="row"><b>Online store</b><span>"men's trail running shoes wide", "{product} review"</span></div>
        </div>
        <p>Start with clear, high-intent searches. The ones with a city, a price word, "near me," or a specific product in them. Skip the ones that only mean somebody's curious. "How does a water heater work" is a reader. "Water heater replacement cost" is a buyer.</p>`,
      note: 'Exact match on Google still includes close variants. Check the actual search terms report every week and block the ones that don\'t fit. "Free water heater" and "water heater jobs" both match "water heater" and neither is a customer.',
      doNow: 'List five searches that mean somebody actually needs what you sell.' }),

    page({ part: P, kicker: '31 / Google', title: 'Keep the account simple.', sub: 'Group related searches with the right ad and the right page. That is the whole structure.', ex: true,
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>Campaign</b><small>Search / Plumbing / Core area. One per service line, or one per area if the areas need different budgets.</small></div></div>
          <div class="step"><i>2</i><div><b>Ad group</b><small>Drain clearing. One job, one ad group.</small></div></div>
          <div class="step"><i>3</i><div><b>Search terms</b><small>Drain clearing, blocked drain service, clogged drain {city}. Five to fifteen, all meaning the same thing.</small></div></div>
          <div class="step"><i>4</i><div><b>Destination</b><small>The drain clearing page. Not the home page. Never the home page.</small></div></div>
        </div>
        <p>Separate budgets only when services, areas, or job values genuinely need different control. A $14,000 roof and a $300 repair shouldn't share a budget, because Google will happily spend it all on the cheap clicks.</p>
        <p>Don't split a small budget into a dozen tiny campaigns. Each one needs enough data to learn, and ten campaigns at $5 a day learn nothing. Three at $17 a day do.</p>`,
      doNow: 'Draw your first campaign on paper before you build it.' }),

    page({ part: P, kicker: '31 / Google', title: 'Write an ad that fits the search.', sub: 'Google ads are not Meta ads. Nobody is scrolling. They asked a question. Answer it.', ex: true,
      body: `
        <div class="shot" style="padding:16px 18px;max-width:520px;margin-bottom:14px;font-size:13px;line-height:1.45"><div style="font-size:10px;color:#6b6963;margin-bottom:4px">Sponsored · example.com/drain-clearing</div><div style="font-family:Bricolage,sans-serif;font-weight:800;font-size:18px;letter-spacing:-.02em;color:#1a4fa0;margin-bottom:4px">Drain Clearing in {City} · Same-Day When Available</div><div style="color:#3a3936">See what the visit includes and what it costs. Licensed, 10 years in {city}. Call {business} or request a visit online.</div></div>
        <div class="cards c3">
          <div class="card"><b>Service</b><small>Say exactly what you do, in the words they typed. If they searched "drain clearing," the headline says drain clearing.</small></div>
          <div class="card"><b>Trust</b><small>Facts you can prove. Years, license, review count, the city.</small></div>
          <div class="card"><b>Action</b><small>Tell them what happens next. Call, or request a visit, or add to cart.</small></div>
        </div>
        <p class="note">Don't claim "open now," "same day," or "free" unless it's true today. Google will approve the ad. Your customer won't forgive it. And a click on the phone link is not a completed call, so track the calls, not the clicks.</p>`,
      doNow: 'Read the ad and the page it opens, back to back. Do they promise the same thing?' }),

    page({ part: P, kicker: '31 / Google', title: 'Check before you spend.', sub: 'A working path from the search to real help. Five things, before the first dollar.',
      body: `
        <div class="checkhead"><span>Check</span><span>OK</span><span>Fix</span><span>?</span></div>
        <div class="check"><div>Area and hours are right.<small>Match where and when you can actually help. Don't run ads at 2am if nobody picks up at 2am.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>The ad opens the right page.<small>Same service, same offer, same words.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>The budget has a ceiling.<small>Know your total test cost before you start. Decide the stop date now.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>The lead has an owner.<small>Alerts, replies, backup. Five minutes. Same rule as everywhere else in this book.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Results can be tracked.<small>Good leads, bookings, and finished jobs, by source, in your records.</small></div><i></i><i></i><i></i></div>
        <p class="note" style="margin-top:18px">Set bids from your real lead data and your real job value, from the numbers worksheet. Don't raise bids just to spend the budget or to take the top spot. The top spot is not the goal. The paid job is.</p>`,
      doNow: 'Test one call and one form all the way to your lead list before you turn it on.' }),

    page({ part: P, kicker: '31 / Google', title: 'Fix the first weak step.', sub: 'When Google isn\'t working, it is almost never "Google isn\'t working." One step is broken. Find it.',
      body: `
        <div class="rows">
          <div class="row"><b>Wrong searches</b><span>You're paying for "water heater jobs" and "free water heater." Add the negative keywords. Weekly.</span></div>
          <div class="row"><b>Clicks, no good leads</b><span>The page, the offer, or the form. Open it on your phone and try to request a visit.</span></div>
          <div class="row"><b>Good leads, no bookings</b><span>Calls, replies, and the 5-minute rule. Listen to the recordings.</span></div>
          <div class="row"><b>Bookings, no jobs</b><span>Fit, quotes, and follow-up. The "win the job" pages in Part 1.</span></div>
          <div class="row"><b>Jobs cost too much</b><span>Prices, job costs, and spend. Back to the numbers worksheet. Sometimes the answer is raise your price, not cut the ads.</span></div>
        </div>
        <p>Change one weak step. Give it time to show a result, a week or two of real spend, not a day. Then look again. Scale only when the cost per paid job works, your team has the time, and the cash is there to wait for the job to finish.</p>`,
      doNow: 'Find the first step where the numbers drop. Fix that one. Only that one.' }),
  ];
};

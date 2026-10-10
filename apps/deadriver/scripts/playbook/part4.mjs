// Part 4: Your 90 days. Plan, first week, worksheets, next step.
export const pages = (page, divider, F) => {
  const P = 'Your 90 days';
  return [
    divider(4, 'Your 90 days.', 'What to do first, what to do next, and the worksheets to do it with.'),

    page({ part: P, kicker: '31 / The plan', title: 'Build it in three steps.', sub: 'Do the next phase when the first one actually works. Not when the calendar says so.',
      body: `
        ${F.fig(F.timeline())}
        <div class="cards c3">
          <div class="card"><span class="tag">Days 1 to 30</span><b>Fix the basics</b><small>Test tracking and lead routing. Fix the phone, the form, and the 5-minute follow-up. Clean up the offer, the website, and the Google profile. Get the CRM honest.</small></div>
          <div class="card"><span class="tag">Days 31 to 60</span><b>Get more good leads</b><small>Pull your buying-signal list. Build the service or product pages. Ask every customer for a review. Launch one funded ad test from Part 3 to that list.</small></div>
          <div class="card"><span class="tag">Days 61 to 90</span><b>Keep what works</b><small>Reach the right past customers. Add reminders. Scale the winning ad with the Launch and Scale setup. Review jobs, costs, and capacity.</small></div>
        </div>
        <p>Don't raise spend because the date changed. Raise it when the full path works, from ad to paid customer, and you can actually handle the work that comes in.</p>
        <p>When you pray for rain, you have to deal with the mud. If the leads double and you can't answer the phone or fill the orders, that's not growth, that's a bad month with more expensive reviews.</p>`,
      doNow: 'Start with phase one. Put the work on the calendar with names next to it.' }),

    page({ part: P, kicker: '31 / The plan', title: 'Your first week.', sub: 'One small task a day gets the whole thing moving.',
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>Day 1</b><small>Pull ten leads. Find the first leak.</small></div></div>
          <div class="step"><i>2</i><div><b>Day 2</b><small>Test the phone, the form, and the chat. Time the response.</small></div></div>
          <div class="step"><i>3</i><div><b>Day 3</b><small>Give every open lead an owner and a dated next task.</small></div></div>
          <div class="step"><i>4</i><div><b>Day 4</b><small>Go through old quotes and abandoned carts. Reply to every open lead.</small></div></div>
          <div class="step"><i>5</i><div><b>Day 5</b><small>Check one finished job or order's revenue and real costs.</small></div></div>
        </div>
        <p class="note">A broken contact path gets fixed the day you find it, not on day 5. Everything else can wait its turn.</p>`,
      doNow: 'Pick the day you start.' }),

    page({ part: P, kicker: '32 / Worksheets', title: 'Your one-fix worksheet.', sub: 'Turn an idea into a task with a name and a date on it.',
      body: `
        <div class="worksheet">
          <div><b>The product or service we want to grow</b></div>
          <div><b>The step where people get stuck</b></div>
          <div><b>What the records show</b></div>
          <div><b>The one change we will make</b></div>
          <div><b>Who owns it, and the due date</b></div>
          <div><b>What we will count to check it worked</b></div>
        </div>
        <p class="note">Use a clear task. "Fix the form alert by Friday." Then test it. Save what changed and what you learned, because you will forget by next month.</p>`,
      doNow: 'Fill this out with the person who owns the work.' }),

    page({ part: P, kicker: '32 / Worksheets', title: 'Your numbers worksheet.', sub: 'One product or service, one time period. Write "not sure" where you don\'t know. That\'s an answer too.',
      body: `
        <div class="worksheet">
          <div><b>Average sale</b>Money from finished jobs or orders ÷ number of them</div>
          <div><b>Gross profit per sale</b>Revenue minus direct costs</div>
          <div><b>Cost per lead</b>Cost to win leads ÷ number of leads</div>
          <div><b>Cost per booking or add-to-cart</b>Same cost ÷ number of bookings</div>
          <div><b>Cost per new customer</b>Same cost ÷ new customers who paid</div>
          <div><b>Most you can pay for a lead</b>Gross profit per sale × your close rate, minus the margin you need</div>
          <div><b>Next month's goal and capacity</b></div>
        </div>`,
      doNow: 'Use real numbers. This page is the first thing we go over on a call.' }),

    page({ part: P, kicker: '32 / Worksheets', title: 'Your ad worksheet.', sub: 'Fill this out before you build the ad. If a box is empty, the ad isn\'t ready.',
      body: `
        <div class="worksheet">
          <div><b>Who is it for (one person, not a group)</b></div>
          <div><b>The buying signal they just gave</b></div>
          <div><b>The pattern interrupt (what's in the picture)</b></div>
          <div><b>The headline (curiosity plus one specific benefit)</b></div>
          <div><b>The lead-in (first two lines, ends mid-thought)</b></div>
          <div><b>The page it goes to (headline matches the ad)</b></div>
          <div><b>What a lead from this ad can cost (from the numbers worksheet)</b></div>
        </div>`,
      doNow: 'Build ten of these before you launch one.' }),

    page({ part: P, kicker: 'Your next step', title: 'You have the playbook.', sub: 'Start with one fix. Build from there.', dark: true,
      body: `
        <div class="cards c2">
          <div class="card"><b>Do it with your team</b><small>Use the worksheets. Fix one handoff at a time. Pull your own list with the Demand Intelligence software and run the ads yourself.</small></div>
          <div class="card"><b>Build it with Dead River</b><small>We find the people looking, build the ads and the page, run the follow-up, and you answer the phone. $50,000 in new revenue in 45 to 60 days, or your money back, plus $500 for wasting your time.</small></div>
        </div>
        <h2>Your side of the guarantee</h2>
        <ul>
          <li>Keep $3,000 a month in ad spend funded, and don't lower it.</li>
          <li>Get back to every lead within 5 minutes.</li>
          <li>Log every lead in the CRM so we're both looking at the same numbers.</li>
          <li>Give it the full 60 days.</li>
        </ul>
        <p>That's it. No fine print. On the call we go over what a customer is worth to you and what your average sale is, and we figure out together whether this is a fit before anybody talks about price.</p>
        ${F.logos()}
        <div class="callout" style="margin-top:14px"><strong style="color:#fff">Book a free 30-minute strategy session at deadrivermanagement.com</strong><br>Or call or text Brandon at (915) 228-3054. brandon@deadrivermanagement.com</div>`,
      doNow: 'Keep one promise: give every customer a clear next step.' }),
  ];
};

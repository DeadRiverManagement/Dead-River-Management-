// Part 1: The system. Rewritten from the old Home Service Growth Playbook for
// every local service business Dead River works with, in Brandon's voice.
export const pages = (page, divider, F) => {
  const P = 'The system';
  const toc = { isToc: true, title: '', render: (n) => '' }; // filled by build.mjs
  toc.render = (n) => `<section class="page"><div class="head"><span class="part">Contents</span></div><h1 style="font-size:34px">What's in here.</h1><p class="sub" style="margin-bottom:14px">Four parts. Start wherever it hurts.</p><div class="body"><div class="toc toc2">${toc.entries || ''}</div></div><div class="foot"><span>Marketing is F*cking Easy</span><span>${n}</span></div></section>`;

  return [
    page({
      part: 'Read this first',
      title: 'Hey,',
      body: `
        <img class="portrait" src="${F.img.brandon}" alt=""><p class="big">This isn't another guide from some marketing guy about how to set up a business page or install a pixel. There are nine thousand of those on YouTube already, and most of them are written by people who have never had to make payroll off the jobs that came in.</p>
        <p class="big">This is what we actually do.</p>
        <p>This is the playbook we run inside Dead River for roofers, plumbers, auto shops, med spas, dentists, freight brokers, online stores, real estate agents, and about 20 other kinds of business. It's what's behind the auto shop that went from $20,000 a month to $100,000, the roofer that went from 2 roofs a month to 8, and the plumber that went from $60,000 a year to $250,000.</p>
        <p>I spent ten years helping businesses get more customers before I started Dead River. And the thing I saw over and over was good businesses paying for clicks while the phone went to voicemail and the cart got abandoned. Spaghetti at the wall. A little bit of this, a little bit of that, and nothing sticks.</p>
        <p>So here's how this is split up:</p>
        <ul>
          <li><strong>Part 1: The system.</strong> How a lead turns into a paid customer, and where it leaks. Numbers, your CRM, follow-up, your Google profile, your website. Boring, and it's where most of the money is.</li>
          <li><strong>Part 2: The people already looking.</strong> How we find the people in your market who are searching for what you sell right now, before they fill out a form anywhere.</li>
          <li><strong>Part 3: The ads.</strong> How to write a Facebook or Instagram ad somebody actually stops for, how to set the account up so a winning ad keeps winning, and how to catch the people typing it into Google.</li>
          <li><strong>Part 4: Your 90 days.</strong> What to do first, what to do next, and the worksheets.</li>
        </ul>
        <p>Most owners get this backwards. They run ads before the phone gets answered. Or they fix the phone and never run an ad. The ones who win do both, in that order.</p>
        <p>That's what this is for. Don't try to do it all at once. Pick one fix. Do it. Then the next one.</p>
        <p class="sig">Brandon</p>
        <p class="note">Dead River Management, El Paso, Texas. (915) 228-3054. brandon@deadrivermanagement.com</p>`,
    }),
    toc,
    divider(1, 'The system.', 'How a lead becomes a paid customer. Fix this before you spend a dollar on ads.'),

    page({ part: P, kicker: 'Your starting point', title: 'Start with one fix.', sub: "You don't need to do all of this at once. Find the row that sounds like your business and go there first.",
      body: `
        <div class="cards">
          <div class="card"><b>Too few calls</b><small>Get found. Parts 2 and 3, and the Google profile and website pages in this part.</small></div>
          <div class="card"><b>Calls, but not many jobs</b><small>Handle each lead. The "fix the leads you have" pages. Start with the 5-minute rule.</small></div>
          <div class="card"><b>Quotes go out and nobody replies</b><small>Help people choose. The "win the job" pages.</small></div>
          <div class="card"><b>Not much repeat work</b><small>Stay in touch. The "bring people back" and "keep good customers" pages.</small></div>
          <div class="card"><b>Not sure what's working</b><small>Track the job. The "track the job" pages, then the weekly check.</small></div>
        </div>`,
      note: 'A lead is anybody who asks about work. Words in {braces} are blanks for you to fill in. Any made-up numbers on these pages are marked as an example. They are not Dead River results.',
      doNow: 'Pick the row that sounds like your business.' }),

    page({ part: P, kicker: '01 / The growth system', title: 'Growth is a team sport.', sub: 'Every step needs a clear next step, and somebody who owns it.',
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>Get found</b><small>The people already looking for you, search, maps, and ads that go to the right people.</small></div></div>
          <div class="step"><i>2</i><div><b>Get the lead</b><small>A clear page and an easy way to call or ask.</small></div></div>
          <div class="step"><i>3</i><div><b>Win the job</b><small>Reply in 5 minutes, book the visit, quote it, close it.</small></div></div>
          <div class="step"><i>4</i><div><b>Do great work</b><small>Finish, check in, ask for the review.</small></div></div>
          <div class="step"><i>5</i><div><b>Grow again</b><small>Stay in touch, track it, fix what broke, then scale.</small></div></div>
        </div>
        <p>If one step is broken, fix it before you send more people through it. Spending more on ads to feed a phone nobody answers is just a faster way to lose money.</p>
        ${F.logos()}
        <p class="note">Some of the businesses this system has run for.</p>`,
      doNow: 'Put a name next to each handoff. One person owns it.' }),

    page({ part: P, kicker: '01 / The growth system', title: 'Where do people get stuck?', sub: "Pull up your last ten leads. If you've got fewer, use all of them.",
      body: `
        <div class="checkhead"><span>Check</span><span>OK</span><span>Fix</span><span>?</span></div>
        <div class="check"><div>Can people find us?<small>Search, maps, and the ads. Where did these ten actually come from?</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Can they reach us?<small>Call your own number. Fill out your own form. Try the chat.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Did we get back to them in 5 minutes?<small>Look at missed calls and forms that sat.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Did they book and buy?<small>Visits, quotes, and the jobs we lost.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Did they come back?<small>Reviews, reminders, repeat work.</small></div><i></i><i></i><i></i></div>
        <p class="note" style="margin-top:18px">Mark each row works, needs work, or not sure. A broken phone or form gets fixed first, before anything else on this list.</p>`,
      doNow: 'Circle one weak spot. That is your first fix.' }),

    page({ part: P, kicker: '02 / Know your numbers', title: 'A sale is not all profit.', sub: "You still have to pay for the work, and for the next job.", ex: true,
      body: `
        <div class="stats">
          <div class="stat"><b>$600</b><small>Direct cost of doing the work. Crew, materials, fuel.</small></div>
          <div class="stat"><b>$100</b><small>What it cost to win the job. Ads, the person answering the phone.</small></div>
          <div class="stat"><b>$300</b><small>What's left for the bills and for you.</small></div>
        </div>
        ${F.fig(F.bars([['The work', 600, '$600'], ['Winning the job', 100, '$100'], ['Left over', 300, '$300', true]]))}
        <p>That's a $1,000 job. The $300 still has to help pay the rent, the truck, and the insurance. Track taxes, refunds, and card fees the same way every time so the number means the same thing every month.</p>
        <p>This is the first thing we go over on a call with a new client, before anybody talks about price. What's a customer worth to you, and what's your average ticket. If you don't know those two numbers, you can't know what a lead is worth, and you'll either overpay for leads or walk away from good ones.</p>`,
      doNow: 'Check the real costs on one finished job.' }),

    page({ part: P, kicker: '02 / Know your numbers', title: 'Follow the people.', sub: 'A reply, a booking, and a paid job are three different things.', ex: true,
      body: `
        <div class="side l">${F.pic('funnel-people', '', 'max-width:300px')}<div class="funnel">
          <div><span>Asked about work</span><b>100</b></div>
          <div style="width:92%"><span>Talked with us</span><b>80</b></div>
          <div style="width:76%"><span>Booked a visit</span><b>50</b></div>
          <div style="width:66%"><span>Showed up</span><b>40</b></div>
          <div style="width:60%"><span>Got a quote</span><b>36</b></div>
          <div style="width:44%"><span>Said yes</span><b>18</b></div>
          <div style="width:40%"><span>Finished and paid</span><b>16</b></div>
        </div></div>
        <p>Painting example. Two of the sold jobs aren't done yet, so don't count their quotes as money collected. The place the numbers drop the hardest is the place to fix first.</p>`,
      doNow: 'Count each step for one group of past leads.' }),

    page({ part: P, kicker: '02 / Know your numbers', title: 'Know what each step costs.', sub: 'Same spend, same group of leads, all the way through.', ex: true,
      body: `
        <div class="rows">
          <div class="row r3"><b>Cost per lead</b><span>$6,000 ÷ 100 leads</span><span><strong>$60</strong></span></div>
          <div class="row r3"><b>Cost per booking</b><span>$6,000 ÷ 50 booked</span><span><strong>$120</strong></span></div>
          <div class="row r3"><b>Cost per new customer</b><span>$6,000 ÷ 16 paid jobs</span><span><strong>$375</strong></span></div>
        </div>
        ${F.fig(F.bars([['Per lead', 60, '$60'], ['Per booking', 120, '$120'], ['Per new customer', 375, '$375', true]]))}
        <p>This uses everything it cost to win those customers, not just the ad spend. Each of the 16 finished jobs is a new customer. Ad spend alone is a different number, and it's the one most agencies will show you because it looks better.</p>
        <p>Cheap leads can cost more. Thirty leads at $17 each that turn into one job cost you more than fifteen leads at $40 that turn into six. Always run it through to the paid job.</p>`,
      doNow: 'Fill in your cost per lead, per booking, and per new customer.' }),

    page({ part: P, kicker: '02 / Know your numbers', title: 'Start with the goal.', sub: 'Then work backwards to the leads and the budget.', ex: true,
      body: `
        <div class="funnel">
          <div><span>Revenue goal</span><b>$60,000</b></div>
          <div><span>At $3,000 a job</span><b>20 jobs</b></div>
          <div><span>If half of the quotes sell</span><b>40 quotes</b></div>
          <div><span>If 4 in 5 visits get a quote</span><b>50 booked</b></div>
          <div><span>If half of the people you reach book</span><b>100 reached</b></div>
          <div><span>If you reach 4 in 5</span><b>125 leads</b></div>
        </div>
        <p>At $40 a lead, that's $5,000 in ad spend. Add tools, fees, and the time of whoever's selling. Then check your crew has the room to do 20 jobs and you can wait to get paid on them. This is a plan, not a forecast.</p>
        <p>This is also why our guarantee needs $3,000 a month in ad spend to work. Under that, the math doesn't get to $50,000 in 60 days for most businesses.</p>`,
      doNow: 'Run it with your own job value and your own past rates.' }),

    page({ part: P, kicker: '03 / The offer', title: 'Make the next step useful.', sub: 'Tell people exactly what they get when they ask for help.',
      body: `
        <div class="rows">
          <div class="row"><b>Who</b><span>Who needs this work? A homeowner with a leak. A fleet manager with 12 trucks. A woman who wants her skin fixed before a wedding.</span></div>
          <div class="row"><b>Problem</b><span>What do they need fixed, in their words, not yours?</span></div>
          <div class="row"><b>Offer</b><span>What will you do first? An inspection, a consult, a quote, a same-week visit.</span></div>
          <div class="row"><b>Proof</b><span>Real facts that build trust. Jobs done, years in business, real reviews, real photos.</span></div>
          <div class="row"><b>Terms</b><span>What costs extra? What's not included? Say it before they ask.</span></div>
          <div class="row"><b>Next step</b><span>Call, text, request a visit, or get a quote. Pick one and make it obvious.</span></div>
        </div>
        <p class="note">Add real timing, real service area, and real price terms. Only use guarantees and payment plans you can actually back up. Don't call a visit free if any part of it has a fee.</p>`,
      doNow: 'Write one clear offer for one service.' }),

    page({ part: P, kicker: '03 / The offer', title: 'Show what they get.', sub: 'A clear scope helps people choose you over the guy with the lower number.', ex: true,
      body: `
        <div class="cards c2">
          <div class="card"><span class="tag">Roofing</span><b>A roof check</b><small>Photos, what we found, and a repair or replace option with a price on each.</small></div>
          <div class="card"><span class="tag">Med spa</span><b>A consult with a plan</b><small>What you want fixed, which treatment, how many sessions, and the total.</small></div>
          <div class="card"><span class="tag">Online store</span><b>A size guide and a 30-day return</b><small>Written out on the product page, so nobody has to email to ask.</small></div>
          <div class="card"><span class="tag">Freight broker</span><b>A rate on one lane in 15 minutes</b><small>What's included, what isn't, and who to call when the truck's late.</small></div>
        </div>
        <p>These are sample offers to show the shape, not Dead River results. The point is the same whether you sell roofs, Botox, or shoes. A vague offer gets compared on price. A clear one gets compared on what's included, and you win that comparison.</p>`,
      doNow: 'Replace one vague offer with a list of what it actually includes.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'Give every lead a home.', sub: "Your CRM is your lead list. It's what keeps a job from getting lost in somebody's text messages.", ex: true,
      body: `
        ${F.crmCard()}
        <p>Source, owner, status, next task, last contact, and what it's worth. Every open lead has all six. "The office" is not an owner. A name is.</p>
        <p>Keep sold, finished, and paid as separate steps. Save the reason when you lose one. Three months from now, the reasons are the most useful thing in the whole system.</p>
        <p>This is also the one condition people push back on with our guarantee, and it's the one we won't drop. If every lead isn't logged, we can't both look at the same numbers, and then the guarantee is just an argument waiting to happen.</p>`,
      doNow: 'Give every open lead one owner and one dated next task.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'Five minutes. Not five hours.', sub: 'A lead that gets a call back in 5 minutes books. A lead that gets a call back tomorrow already hired the other guy.',
      body: `
        ${F.pic('five-minutes', '', 'max-width:360px')}
        <div class="steps">
          <div class="step"><i>1</i><div><b>New lead</b><small>Check for spam, repeats, and whether it's something you actually sell.</small></div></div>
          <div class="step"><i>2</i><div><b>Ready to help</b><small>Assign an owner. Alert the team. The alert goes to a phone, not an inbox.</small></div></div>
          <div class="step"><i>3</i><div><b>First reply, inside 5 minutes</b><small>A real person calls or texts. Say what happens next.</small></div></div>
          <div class="step"><i>4</i><div><b>Human check</b><small>Did a person actually try to reach them on time? If not, the backup gets alerted.</small></div></div>
        </div>
        <p>An auto-reply is not a conversation. It buys you a minute, it doesn't buy you the job. Only promise a response time your team can actually hit, and then hit it.</p>
        <p>Speed to lead is a must with us. It's written into the guarantee because it's the single biggest thing we've seen separate the businesses that grow from the ones that say "ads don't work."</p>`,
      doNow: 'Send yourself a test lead. Time how long it takes a human to respond.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'Build a stop button.', sub: 'The next message should fit what the person just did.',
      body: `
        <div class="rows">
          <div class="row"><b>They reply</b><span>Stop the automated chase. A person takes over.</span></div>
          <div class="row"><b>They book</b><span>Stop the lead messages. Send the visit details.</span></div>
          <div class="row"><b>They buy</b><span>Move them to the job and the aftercare.</span></div>
          <div class="row"><b>They say stop</b><span>Stop that channel. Save the choice. Don't make them say it twice.</span></div>
          <div class="row"><b>Wrong person or failed send</b><span>Stop. Fix the record or close it.</span></div>
        </div>
        <p>Check the record before every send. That includes when somebody books by phone or pays some other way. Nothing kills trust faster than a "still need help?" text the day after they paid you.</p>`,
      doNow: 'Test every branch before you turn a workflow on.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'Missed a call? Reach back.', sub: 'Call back the second your team can. In the meantime, the text goes out.', ex: true,
      body: `
        <div class="side l">${F.sms([['Hey {first_name}, this is {name} at {business}. Sorry we missed your call. What do you need, and what\'s the ZIP code? Reply STOP to stop texts.', true], ['Hey, yeah, the water heater is leaking. 79912', false], ['Got it. I can have somebody there between 1 and 3 today. Does that work?', true]])}
        <div class="steps">
          <div class="step"><i>1</i><div><b>Check the number and the text permission.</b></div></div>
          <div class="step"><i>2</i><div><b>Send it once. Then make a real callback.</b></div></div>
          <div class="step"><i>3</i><div><b>If they reply, a person takes over.</b></div></div>
        </div></div>
        <p class="note">Skip spam, wrong numbers, and repeats. Don't promise an open slot you haven't checked.</p>`,
      doNow: 'Give missed calls a callback task and a backup owner.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'Show them the form worked.', sub: "Say you got it. Don't invent a booking.", ex: true,
      body: `
        <div class="side l"><div class="shot" style="padding:14px 16px;font-size:12.5px;line-height:1.5"><div style="font-family:ui-monospace,Menlo,monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#6b6963;margin-bottom:8px">Email · auto-sent, then a human follows</div><b>Subject: Your {service} request</b><br><br>Hey {first_name}, we got your request. I'm {name} at {business}. We'll {next_step} by {real_time}. You can reply here or call {phone}.<br><br>{name}</div>
        <div class="steps">
          <div class="step"><i>1</i><div><b>Save the source and what they asked for.</b></div></div>
          <div class="step"><i>2</i><div><b>Assign one person to follow up.</b></div></div>
          <div class="step"><i>3</i><div><b>Check the reply and failed-send routes actually work.</b></div></div>
        </div></div>
        <p class="note">Only use a time you can meet. A request is not a confirmed visit. Keep the marketing sign-up separate from the request if you need to.</p>`,
      doNow: 'Send one test form from your site all the way to your lead list.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'Make the visit easy.', sub: 'People should know when, where, and what it costs before you show up.', ex: true,
      body: `
        <div class="rows">
          <div class="row"><b>When</b><span>{date}, {arrival_window}, {time_zone}</span></div>
          <div class="row"><b>Where</b><span>{service_address}</span></div>
          <div class="row"><b>What</b><span>{visit_scope} and {fee_or_terms}</span></div>
          <div class="row"><b>Access</b><span>{gate, pet, or entry needs}</span></div>
        </div>
        <div class="side r"><div class="shot" style="padding:12px 14px;font-size:12px;color:#3a3936">Same details on the confirmation page, the email, and the text. People should never have to ask "what time again?"</div>${F.sms([['{business}: Your {service} visit is set for {date}, {window}. Please {access_step}. Need a different time? Call {phone}. Reply STOP to stop texts.', true], ['Perfect, see you then', false]])}</div>
        <p class="note">Remind them the day before and again close to the visit. Kill the old reminders if the time changes or the visit gets canceled.</p>`,
      doNow: 'Send the visit details and an easy way to change the time.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: "Don't lose the quote.", sub: 'A quote you sent still needs a next step. Most of them die in an inbox.', ex: true,
      body: `
        <div class="cards c3">
          <div class="card"><b>Send</b><small>Explain the work, the price, and what's left out.</small></div>
          <div class="card"><b>Agree</b><small>Ask when they plan to decide. Write it down.</small></div>
          <div class="card"><b>Follow up</b><small>Use that date. Answer the next question.</small></div>
        </div>
        <div class="side l">${F.sms([['Hey {first_name}, did the {service} quote come through okay? Happy to walk you through what\'s included. Would {time} work? {name}, {business}. Reply STOP to stop texts.', true], ['It did, we\'re comparing a couple. Tomorrow at 5 works.', false]])}<div class="card"><b>Write the date down</b><small>"Tomorrow at 5" goes in the CRM as the next task, with a name on it. That's the whole trick. Most quotes die because nobody owned the follow-up.</small></div></div>
        <p class="note">If they accept, decline, or ask you to stop, change the plan. No fake deadlines to push the sale. If the price is only good until Friday, it's because of something real, like material costs.</p>`,
      doNow: 'Ask every quoted lead when they want to go over it with you.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'No reply? Use a short plan.', sub: "Keep each touch useful. Don't send forever.", ex: true,
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>First day</b><small>Try to reach them. Give a clear next step.</small></div></div>
          <div class="step"><i>2</i><div><b>Next business day</b><small>Try once more if it's still allowed and still useful.</small></div></div>
          <div class="step"><i>3</i><div><b>A few days later</b><small>Ask if they still need help, then close the loop.</small></div></div>
        </div>
        ${F.sms([['Hey {first_name}, do you still need help with {service}? If now\'s not a good time, just let me know and I\'ll stop messaging you. {business}, {phone}.', true]])}
        <p class="note">A reply, a booking, a sale, a no, or a stop changes this plan. Longer-term tips and seasonal check-ins need their own permission and a real reason.</p>`,
      doNow: 'Set a limit and a stop rule for leads that never answer.' }),

    page({ part: P, kicker: '04 / Fix the leads you have', title: 'Missed visit? Offer a reset.', sub: 'Find out what happened before you write someone off as a no-show.', ex: true,
      body: `
        <div class="side l">${F.sms([['Hey {first_name}, this is {name} at {business}. We couldn\'t get the visit done today. Want to set a new time, or has the plan changed? Reply STOP to stop texts.', true], ['Sorry, got stuck at work. Can we do Saturday?', false]])}
        <div class="steps">
          <div class="step"><i>1</i><div><b>Check for a delay, a change, or a canceled visit on your side first.</b></div></div>
          <div class="step"><i>2</i><div><b>Offer real open times if they still need help.</b></div></div>
          <div class="step"><i>3</i><div><b>Save the result and stop the old reminders.</b></div></div>
        </div></div>
        <p class="note">If there was a service problem, hand it to a person to fix. Never send a sales message to somebody who's waiting on you to make something right.</p>`,
      doNow: 'Create a same-day recovery task for missed visits.' }),

    page({ part: P, kicker: '05 / Google Business Profile', title: 'Make your map profile clear.', sub: 'If customers find you on a map, this is the front door. If you\'re online only, keep it accurate and move on.',
      body: `
        <div class="side l"><div class="shot" style="padding:14px 16px"><div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><img src="${F.img.brandon}" alt="" style="width:44px;height:44px;border-radius:8px;object-fit:cover;object-position:top"><div><b style="font-size:14px">Dead River Management</b><div style="font-size:11px;color:#6b6963">Marketing agency · El Paso, TX</div></div></div><div style="font-size:12px;color:#c8743f;margin-bottom:6px">★★★★★ <span style="color:#3a3936">5.0 · Google reviews</span></div><div style="font-size:11.5px;line-height:1.5;color:#3a3936">Open · Closes 6 PM<br>(915) 228-3054<br>deadrivermanagement.com</div><div style="display:flex;gap:6px;margin-top:10px">${['Call', 'Website', 'Book'].map((b) => `<span style="font-size:10.5px;padding:5px 10px;border-radius:999px;border:1px solid rgba(18,18,20,.14)">${b}</span>`).join('')}</div></div>
        <div class="rows">
          <div class="row"><b>Name</b><span>Your real business name. Not "Best Roofer El Paso Cheap."</span></div>
          <div class="row"><b>Category</b><span>The closest match for your main work. Secondary categories for the rest.</span></div>
          <div class="row"><b>Area</b><span>The places you actually serve. Not the whole state.</span></div>
          <div class="row"><b>Hours</b><span>When a customer can actually reach a human.</span></div>
          <div class="row"><b>Links</b><span>Phone, website, and a booking link that works.</span></div>
          <div class="row"><b>Photos</b><span>Real photos of real work. Your truck, your team, a finished job, your storefront. Not stock.</span></div>
        </div></div>
        <p class="note">List your real services. Write a plain description. Keep the name, phone, and address the same across your site and every profile. Google notices when they don't match.</p>`,
      doNow: 'Check your name, phone, hours, and website on the profile today.' }),

    page({ part: P, kicker: '05 / Google Business Profile', title: 'Keep it real. Keep it current.', sub: 'Wrong details cost you calls. Fake details can get the whole profile pulled.',
      body: `
        <div class="checkhead"><span>Check</span><span>OK</span><span>Fix</span><span>?</span></div>
        <div class="check"><div>Use the real name.<small>No extra keywords, no fake towns.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Use real locations.<small>No made-up office, no second listing for the same shop.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Check the address rules.<small>Hide a home address if customers don't come to you.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Keep hours and photos fresh.<small>Show real work, with permission.</small></div><i></i><i></i><i></i></div>
        <div class="check"><div>Test the links.<small>Calls and booking requests have to reach your team.</small></div><i></i><i></i><i></i></div>
        <p class="note" style="margin-top:18px">Nobody can promise you the top map spot. Anybody who does is selling something. What you can control is being complete, accurate, reviewed, and active.</p>`,
      doNow: 'Set a monthly reminder to check the profile.' }),

    page({ part: P, kicker: '06 / Reviews', title: 'Ask for honest reviews.', sub: 'Every real customer gets the same ask. The ones who leave a review are the ones who were asked.', ex: true,
      body: `
        <div class="side l">${F.sms([['Hey {first_name}, thanks for going with {business}. Would you mind leaving an honest review? {review_link}. Good or bad, it helps us. If anything\'s not right, call me at {phone}. Reply STOP to stop texts.', true], ['Done! You guys were great.', false]])}
        <div class="compare" style="grid-template-columns:1fr">
          <div class="good"><b>Do</b>Ask right after the job, while they're happy. Make it one tap. Use your review link or a QR code on the invoice.</div>
          <div class="bad"><b>Skip</b>Gifts for reviews, fake reviews, pressure, and only sending the happy people to Google. All of it can get you flagged.</div>
        </div></div>
        <p class="note">Use a channel you have permission for. One reminder is plenty. Stop on a review, a stop reply, or a failed delivery.</p>`,
      doNow: 'Add a plain review request to the end of every job.' }),

    page({ part: P, kicker: '06 / Reviews', title: 'Reply like a person.', sub: 'Thank people. Take care of the problem. Everybody reading the reviews is watching how you handle the bad one.', ex: true,
      body: `
        <div class="card" style="margin-bottom:10px"><span class="tag">Positive review</span><small>Thanks for taking the time to write that. Glad we could get the {service} handled for you. {business}</small></div>
        <div class="card" style="margin-bottom:12px"><span class="tag">Service concern</span><small>I'm sorry to hear that, and I want to make it right. Please call me, {name}, at {phone_or_email} so I can look at what happened and fix it.</small></div>
        <p>If you messed up, say so. "I messed up, here's what happened, here's how we're fixing it." People trust that a lot more than a defensive paragraph. Keep private details out of the reply. Never make fixing the problem conditional on them changing the review.</p>`,
      doNow: 'Read your last ten reviews. Find one thing the team can do better.' }),

    page({ part: P, kicker: '07 / Search', title: 'Give each service its own page.', sub: 'Search engines rank pages, not businesses. One page for "plumbing" loses to one page per thing you fix.', ex: true,
      body: `
        <div class="side l"><div class="shot" style="padding:0"><div style="display:flex;gap:5px;padding:8px 10px;border-bottom:1px solid rgba(18,18,20,.12)"><i style="width:8px;height:8px;border-radius:50%;background:#c9c5bc;display:block"></i><i style="width:8px;height:8px;border-radius:50%;background:#c9c5bc;display:block"></i><i style="width:8px;height:8px;border-radius:50%;background:#c9c5bc;display:block"></i></div><div style="padding:14px 16px"><div style="font-family:Bricolage,sans-serif;font-weight:800;font-size:18px;line-height:1.05;letter-spacing:-.02em;margin-bottom:8px">Water heater replacement in {city}</div><div style="display:grid;gap:5px">${['What\'s included', 'What changes the price', 'Real jobs and reviews', 'Questions people ask'].map((l) => `<div style="font-size:11px;padding:6px 8px;border-radius:6px;background:rgba(18,18,20,.05)">${l}</div>`).join('')}<div style="font-size:11px;padding:8px;border-radius:6px;background:#c8743f;color:#140b04;text-align:center;font-weight:600">Request a visit</div></div></div></div>
        <div class="rows">
          <div class="row"><b>Title</b><span>Water heater replacement in {city}. Or "Men's trail running shoes." One page per thing you sell.</span></div>
          <div class="row"><b>Scope</b><span>Removal, the new unit, permits, haul-away, what's not included.</span></div>
          <div class="row"><b>Cost</b><span>What changes the price. Tank or tankless, access, gas or electric.</span></div>
          <div class="row"><b>Proof</b><span>Real jobs, real photos, real reviews about this service.</span></div>
          <div class="row"><b>Next step</b><span>Call, request a visit, or add to cart. One button, easy to find on a phone.</span></div>
        </div></div>
        <p class="note">Answer the questions people actually ask. Link related pages to each other. Clear headings, a useful description, and it has to work on a phone, because that's where most of your customers are reading it.</p>`,
      doNow: 'Build or fix one page for your best service.' }),

    page({ part: P, kicker: '07 / Search', title: 'Make each town page useful.', sub: 'Swapping the city name on the same page is not a town page. Same goes for swapping the product name. Google knows, and so does the person reading it.', ex: true,
      body: `
        <div class="compare">
          <div class="bad"><b>Thin page</b>Same text, different city name.<br><br>Claims an office that isn't there.<br><br>No real jobs from that area.</div>
          <div class="good"><b>Useful page</b>Shows the real area you serve and how far out you go.<br><br>Explains local timing, permits, HOA stuff, whatever's actually different there.<br><br>Real work and real questions from that town.</div>
        </div>
        <p>Don't invent jobs or offices. If two pages are doing the same job, one strong page beats two weak ones.</p>`,
      doNow: 'Open one town page. Add a real reason for it to exist, or merge it.' }),

    page({ part: P, kicker: '07 / Search', title: 'Help search find the page.', sub: 'Good content still has to be easy to open and easy to use.',
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>Test the page</b><small>Does it load fast on a phone? Do the links and the form work?</small></div></div>
          <div class="step"><i>2</i><div><b>Check search access</b><small>Use Search Console to inspect the page. It's free.</small></div></div>
          <div class="step"><i>3</i><div><b>Link it</b><small>Add a link from a related page people already visit.</small></div></div>
          <div class="step"><i>4</i><div><b>Keep it useful</b><small>Fix old facts. Merge weak repeat pages carefully.</small></div></div>
        </div>
        <p class="note">Search Console is Google's free site-check tool. Have whoever runs your website check indexing, the sitemap, and the page code once a quarter.</p>`,
      doNow: 'Open your main service page on your phone right now.' }),

    page({ part: P, kicker: '08 / AI search', title: 'Answer what people ask.', sub: 'Clear answers help people, help Google, and help the AI tools that more and more people are asking instead of Google.', ex: true,
      body: `
        <div class="card" style="margin-bottom:12px"><b>How much is a new water heater?</b><small>It depends on the unit, the access, and the work needed. Ask if removal, parts, permits, and any changes to the home are in the quote. Most of our jobs land between {low} and {high}.</small></div>
        <div class="rows">
          <div class="row"><b>Ask</b><span>Get the answer from the person who actually does the work.</span></div>
          <div class="row"><b>Write</b><span>Short answer first. Then what changes it.</span></div>
          <div class="row"><b>Check</b><span>Real facts only. Show what could change the answer.</span></div>
        </div>
        <p class="note">Add local prices only when you can back them up. Clear content helps you get found. Nobody can promise you an AI mention or a ranking.</p>`,
      doNow: 'Write down the five questions your customers ask most.' }),

    page({ part: P, kicker: '08 / AI search', title: 'Use one answer three ways.', sub: "You don't need to post everywhere. You need one good answer in three places.",
      body: `
        <div class="cards c3">
          <div class="card"><b>Website</b><small>The clear answer with the next step under it.</small></div>
          <div class="card"><b>Short video</b><small>You or a tech explaining it in plain words. Phone camera is fine. Better, actually.</small></div>
          <div class="card"><b>Follow-up</b><small>Send it when a customer asks the same thing by text.</small></div>
        </div>
        <h2>Questions to try</h2>
        <div class="cards c2">
          <div class="card"><small>Should I fix or replace my AC?</small></div>
          <div class="card"><small>Why is my AC not cooling?</small></div>
          <div class="card"><small>How long does a roof last here?</small></div>
          <div class="card"><small>How many sessions until I see a difference?</small></div>
        </div>
        <p class="note">Use AI to help you draft. Don't let it invent facts. Somebody who does the work checks the answer before it goes up.</p>`,
      doNow: 'Pick one question. Make it a page and a 60-second clip.' }),

    page({ part: P, kicker: '09 / Your website', title: 'Help them choose you.', sub: 'The page has to match the promise that brought them there. Same words, same offer.', ex: true,
      body: `
        <div class="rows">
          <div class="row"><b>Top</b><span>The service, the area, and the next step. Visible without scrolling.</span></div>
          <div class="row"><b>Proof</b><span>Real facts that build trust. Years, jobs, reviews, photos.</span></div>
          <div class="row"><b>Problem</b><span>What the customer is dealing with, in their words.</span></div>
          <div class="row"><b>Solution</b><span>What the service includes.</span></div>
          <div class="row"><b>Process</b><span>How the job will go, step by step.</span></div>
          <div class="row"><b>Reviews</b><span>Real customer feedback, with names.</span></div>
          <div class="row"><b>Questions</b><span>Fees, timing, and the terms people ask about.</span></div>
          <div class="row"><b>Next step</b><span>Call, a short form, or the buy button. Again. People scroll.</span></div>
        </div>
        <p class="note">Put a working phone link or buy button where it's easy to hit with a thumb. Show only real licenses, terms, and payment plans.</p>`,
      doNow: 'Click one of your own ads. Does the page promise the same thing the ad did?' }),

    page({ part: P, kicker: '09 / Your website', title: 'Make asking for help easy.', sub: 'A short form collects what the team needs for the next step. Nothing more.', ex: true,
      body: `
        <div class="card" style="max-width:360px;margin-bottom:14px"><b>Request a quote</b><div class="worksheet" style="margin:10px 0 0;gap:6px"><div style="min-height:34px">Name</div><div style="min-height:34px">Phone</div><div style="min-height:34px">ZIP code</div><div style="min-height:34px">What do you need done?</div></div><div class="donow" style="margin-top:10px;padding:10px 14px;justify-content:center"><span>Send request</span></div></div>
        <div class="steps">
          <div class="step"><i>1</i><div><b>Ask only what helps you route the job.</b></div></div>
          <div class="step"><i>2</i><div><b>Show that the request went through, and say who will reply and when.</b></div></div>
          <div class="step"><i>3</i><div><b>If you use chat, and it's AI, say so. Never let it invent a price or an open slot.</b></div></div>
        </div>`,
      doNow: 'Fill out your own form on your phone. Time how long until a human replies.' }),

    page({ part: P, kicker: '10 / Win the job', title: 'Make the call feel easy.', sub: 'Listen first. Then guide them to the next step.', ex: true,
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>Welcome</b><small>"Thanks for calling {business}, this is {name}. What's going on?"</small></div></div>
          <div class="step"><i>2</i><div><b>Check fit</b><small>"What do you need done, and what's the ZIP?"</small></div></div>
          <div class="step"><i>3</i><div><b>Explain</b><small>"The visit includes {scope}. The fee or terms are {terms}."</small></div></div>
          <div class="step"><i>4</i><div><b>Book</b><small>"I've got {real_slots}. Which one works for you?"</small></div></div>
        </div>
        <p>Confirm the address, the access, the date, and the arrival window. If you can't help, say so and point them somewhere. Don't promise a time that isn't open.</p>
        <p class="note">Whoever answers your phone is your most expensive salesperson. Practice this with them, and listen to a few recorded calls a month.</p>`,
      doNow: 'Run this script with the person who answers your calls.' }),

    page({ part: P, kicker: '10 / Win the job', title: 'Help them compare.', sub: 'A calm question beats pressure every time.', ex: true,
      body: `
        <div class="card" style="margin-bottom:10px"><b>"The price is too high."</b><small>"Is it over your budget, or over another quote? Let's compare what's included, because that's usually where the gap is."</small></div>
        <div class="card" style="margin-bottom:10px"><b>"We need to think about it."</b><small>"Of course. What would help you decide, the scope, the timing, or the price?"</small></div>
        <div class="card" style="margin-bottom:12px"><b>"We're getting a few quotes."</b><small>"That makes sense. I'll send over our scope and terms so you're comparing the same thing."</small></div>
        <p>Agree on a follow-up time. Save the reason if they don't buy. Don't shame them, and don't make up urgency.</p>`,
      doNow: 'Ask one calm question before you defend the price.' }),

    page({ part: P, kicker: '11 / Bring people back', title: 'Start with the right group.', sub: 'Old records need a check before a new message goes out.',
      body: `
        <div class="cards c2">
          <div class="card"><b>Old quotes and abandoned carts</b><small>Ask if it's still planned. Half of them are.</small></div>
          <div class="card"><b>Past customers</b><small>Offer a service they're due for. Filter change, tune-up, touch-up.</small></div>
          <div class="card"><b>Missed visits</b><small>Offer a new time if it's still useful to them.</small></div>
          <div class="card"><b>Seasonal work</b><small>Ask about the next job the season brings.</small></div>
        </div>
        <p>Remove wrong numbers, opt-outs, and duplicates. Check you have permission for the channel. Skip anybody with an active job or an open complaint. Don't blast the whole list, pick a group with a real reason to hear from you.</p>`,
      doNow: 'Pick one small group with a real reason to hear from you.' }),

    page({ part: P, kicker: '11 / Bring people back', title: 'Send a useful check-in.', sub: 'A specific reason beats a vague sales push.', ex: true,
      body: `
        <div class="side l">${F.sms([['Hey {first_name}, this is {name} at {business}. Are you planning a {seasonal_job} this year? We can quote {real_scope}. Want me to come take a look? Reply STOP to stop texts.', true], ['Yeah actually, probably next month', false], ['Perfect. I\'ll check back the first week. Thanks {first_name}.', true]])}
        <div class="cards c3" style="grid-template-columns:1fr">
          <div class="card"><b>Yes</b><small>Ask about the work and offer real times.</small></div>
          <div class="card"><b>Later</b><small>Save the date they give you. Come back then.</small></div>
          <div class="card"><b>No or stop</b><small>Close the task or stop messages.</small></div>
        </div></div>
        <p class="note">For old quotes, ask if the work is still needed first. Confirm the current scope and price before you send a number.</p>`,
      doNow: 'Try one small group first. Track replies, jobs, and what it cost.' }),

    page({ part: P, kicker: '12 / Keep good customers', title: 'The next job starts here.', sub: 'Good follow-through gives people a reason to come back and a reason to tell somebody.',
      body: `
        <div class="steps">
          <div class="step"><i>1</i><div><b>Finish well</b><small>Explain the work and what to do to take care of it.</small></div></div>
          <div class="step"><i>2</i><div><b>Check in</b><small>A day or two later. Make sure it's right.</small></div></div>
          <div class="step"><i>3</i><div><b>Ask for the review</b><small>Honest feedback, one tap.</small></div></div>
          <div class="step"><i>4</i><div><b>Remind</b><small>A real service need, on a channel you're allowed to use.</small></div></div>
          <div class="step"><i>5</i><div><b>Earn the next job</b><small>A plan, a related service, or a referral link.</small></div></div>
        </div>
        <p class="note">Handle service issues first. Offer extra work only when it fits. Don't add somebody's friend to a text list because they got referred.</p>`,
      doNow: 'Put the next useful service date on every customer record.' }),

    page({ part: P, kicker: '12 / Keep good customers', title: 'Make plans easy to understand.', sub: 'A maintenance plan has to work for the customer and for your crew.', ex: true,
      body: `
        <div class="rows">
          <div class="row"><b>What</b><span>List the work and what's not included.</span></div>
          <div class="row"><b>When</b><span>Visit count and the schedule.</span></div>
          <div class="row"><b>Price</b><span>Fees, renewal, and how to cancel.</span></div>
          <div class="row"><b>Delivery</b><span>Make sure the crew can actually do the visits.</span></div>
        </div>
        <div class="stats">
          <div class="stat"><b>$1,800</b><small>Yearly plan revenue</small></div>
          <div class="stat"><b>$1,200</b><small>Service and care costs</small></div>
          <div class="stat"><b>$600</b><small>Left before sales costs and fixed bills</small></div>
        </div>
        <p class="note">Pool service teaching example. Track visits used, repeat work, and who leaves. Future payments are not cash in the bank yet.</p>`,
      doNow: 'Write the tasks, dates, price, and terms before you sell a plan.' }),

    page({ part: P, kicker: '13 / Track the job', title: 'Connect the lead to the job.', sub: 'One ID from the first call to the paid invoice or the shipped order. Otherwise you are guessing which ads work.', ex: true,
      body: `
        ${F.fig(F.flow([['Source', 'ad, search, referral'], ['Lead', 'job ID + owner'], ['Quote', 'what happened'], ['Done', 'work + costs'], ['Paid', 'money in']], { last: true, h: 80 }))}
        <div class="steps">
          <div class="step"><i>1</i><div><b>Source</b><small>Search, map, ad, referral, or other.</small></div></div>
          <div class="step"><i>2</i><div><b>Lead</b><small>Job ID, source, owner.</small></div></div>
          <div class="step"><i>3</i><div><b>Visit and quote</b><small>What happened and what comes next.</small></div></div>
          <div class="step"><i>4</i><div><b>Finished job</b><small>Work done and the direct costs.</small></div></div>
          <div class="step"><i>5</i><div><b>Paid invoice</b><small>Money received, less any refund.</small></div></div>
        </div>
        <p class="note">Keep repeat requests about the same job together. A click, a form, and a call can all be one lead. Two ad platforms will both claim the same sale. Your job records are the referee.</p>`,
      doNow: 'Pick one finished job. Trace it back to where it came from.' }),

    page({ part: P, kicker: '13 / Track the job', title: 'Use each tool for its job.', sub: 'Your job and payment records show what the business actually earned. Everything else is a clue.',
      body: `
        <div class="rows">
          <div class="row"><b>GA4</b><span>What people do on your site.</span></div>
          <div class="row"><b>Search Console</b><span>How people find your site on Google.</span></div>
          <div class="row"><b>Call and form tracking</b><span>Which path brought the request.</span></div>
          <div class="row"><b>CRM and job records</b><span>Who booked, bought, and finished.</span></div>
          <div class="row"><b>Payment records</b><span>What got paid and what it cost.</span></div>
        </div>
        <p class="note">Use tagged links (UTMs) to label where traffic came from. Keep names, emails, and phone numbers out of ordinary analytics fields and page URLs.</p>`,
      doNow: 'Check that one test form reaches tracking and your CRM, once.' }),

    page({ part: P, kicker: '14 / Check and improve', title: 'Check the week. Pick one fix.', sub: 'Look at the business numbers, then decide what to do. Not the other way around.',
      body: `
        <div class="cards c2" style="margin-bottom:14px">
          <div class="card"><small>New leads</small></div><div class="card"><small>People reached in 5 minutes</small></div>
          <div class="card"><small>Visits booked and kept</small></div><div class="card"><small>Quotes sent and won</small></div>
          <div class="card"><small>Jobs finished</small></div><div class="card"><small>Money collected</small></div>
          <div class="card"><small>Work plus marketing costs</small></div><div class="card"><small>Cost per paid job</small></div>
        </div>
        <div class="cards c3">
          <div class="card"><b>What brought good jobs?</b></div>
          <div class="card"><b>Where did people get stuck?</b></div>
          <div class="card"><b>What one change is next?</b></div>
        </div>
        <p class="note">Give recent leads time to turn into jobs. Don't compare an unfinished week with a finished one. Count repeat customers separately.</p>`,
      doNow: 'Write one next action, one owner, and one due date. Every week.' }),
  ];
};

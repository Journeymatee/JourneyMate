'use strict'

/**
 * Long-form article bodies for the curated blog posts.
 *
 * Stored separately from seed.js so the seed file stays focused on the
 * shape of the row and the article content stays editable as plain
 * Markdown. The frontend renders this with a small custom Markdown
 * subset (h2/h3, paragraphs, bullet lists, blockquotes, bold/italic,
 * inline code, links).
 *
 * Keys are blog_post slugs. The seeder will UPSERT the body whenever
 * the backend boots, so editing this file is enough to change the
 * article in the running app.
 */
const BLOG_ARTICLE_BODIES = {

'varanasi-silver-gold-2026': `
Varanasi is the rare destination where the price you pay isn't really for
the city — it's for how close you get to the river. Silver is a hostel two
lanes back, the public boat at sunrise, and Kashi Chaat for ₹40. Gold is
a heritage room with a Ganga balcony, your own boat, and someone else
handling the queue at Kashi Vishwanath.

We compared a 5-day plan across both tiers — real numbers, real hotels,
real menu items. Here's where the rupee actually goes.

## What ₹14,500 (Silver) buys you

- **Stay**: Zostel Varanasi or Brijrama Guest House — ₹600–900/night for a private double or dorm bed. Both are walking distance from Dashashwamedh Ghat.
- **Transport**: Hyderabad → Varanasi via Humsafar Express (12771), AC 3-tier berth ~₹1,350. About 26 hours one-way; bring a book and download offline maps.
- **Food**: Kashi Chaat Bhandar, Blue Lassi, Deena Chat — three institutions, total spend under ₹500/day.
- **Aarti**: Stand on the public viewing area at Dashashwamedh — free, slightly chaotic, unforgettable.
- **Sarnath day trip**: Public bus + entry tickets, ~₹150 round-trip.

## What ₹27,000 (Gold) adds

- **Stay**: BrijRama Palace heritage suite or Nadesar Palace — ₹12k–18k/night with a Ganga view.
- **Transport**: IndiGo or Air India direct flight, ~2h15m, ₹4,500–6,000 one-way.
- **Aarti**: A private boat with chai service, your own viewing angle.
- **Darshan**: Concierge-arranged VIP entry at Kashi Vishwanath — saves 1–2 hours of queueing on busy days.
- **Food**: Varuna at BrijRama, curated ghats food walks, rooftop dinners with the river lit up below.

## The honest take

If you're going for the *experience* — sunrise on the river, the chaos of
the lanes, that strange peace at Manikarnika — Silver gets you 80% of it.
Gold buys quieter mornings, faster queues, and fewer logistics. There's
no "wrong" answer; there's only what you'd rather your money do.

> Tip: split it. Two nights at a hostel for the lane-walking, then one night at BrijRama for the river. Best of both, ~₹19,000 total.

The trick with Varanasi is showing up willing to be still. Whatever you
spend, the city does the heavy lifting.
`,

'goa-budget-beyond-beaches': `
Goa on a tight budget is not "Baga + Calangute, repeat." That route is
where every first-timer lands and where everybody ends up paying a 30%
premium for the privilege. The same trip done well costs less and feels
twice as Goan.

Here's a 4-day plan we've personally run for under ₹10,000 per person —
including transport, stays, food, and a couple of evening splurges.

## Where to actually stay

- **Anjuna or Vagator** for backpacker energy — Zostel, Backpacker Panda, ₹450–600/night.
- **Assagao or Saligao** for quiet hinterland charm — boutique homestays from ₹1,200/night, banyan trees, no honking.
- **Palolem (south)** for slow days — beach huts ₹800–1,500/night, hammocks, fewer reels.

Skip Calangute unless you're 22 and on a stag.

## A 4-day rhythm that works

1. **Day 1 — North Goa orientation**: Bus from your hometown overnight, hostel check-in, Calangute & Baga for the obligatory tick, beach-shack seafood dinner.
2. **Day 2 — Beach hopping**: Anjuna Flea Market on Wednesdays or Saturdays, Vagator cliff sunset, Chapora Fort, Arambol bonfire night.
3. **Day 3 — South Goa day-trip**: Palolem (₹150 bus or ₹800 cab one-way), Old Goa churches en route, Colva evening stroll, fish curry rice ₹120.
4. **Day 4 — Slow morning, head home**: Mapusa market for cashews and *bebinca*, last swim, bus or train back.

## Where to splurge (just one evening)

Antares at Vagator, Thalassa at Vagator, or Fisherman's Wharf at Cavelossim. Pick **one** sunset, one premium meal, ₹2,500 per person. You'll remember that more than three average ones.

## Practical notes

- **Rent a scooter** (₹350/day) — taxis between beaches add up fast.
- **Buy at Mapusa**, not at the airport. Cashews are a third of the price.
- **Cash for shacks**, card for resorts. UPI works almost everywhere now.

> The most overrated thing in Goa is the resort dinner. The most underrated is the back-lane bakery for pao at 7 a.m.

Goa rewards travellers who slow down. The "more places per day" approach
is a tax on enjoyment.
`,

'manali-monsoon-safety': `
Monsoon Manali is one of those trips most blogs warn you off. They're
half right and half wrong. Here's how to read the conditions, when to go,
and how to keep the budget alive even if you have to switch plans on day 2.

## The honest risk picture

Mid-July to mid-September brings rain to the Kullu valley and the
Manali–Leh highway is *closed* most years past Rohtang or Atal Tunnel.
Landslides are common on NH-3 between Mandi and Kullu. That doesn't mean
"don't go" — it means **build buffers**.

- Skip July 15 – August 25 if you have a hard return date.
- Best windows: late June (just before the heaviest rain) or first week of September (clearing up, green everywhere).

## Saving money when monsoon shows up

- **Book direct, not on aggregators.** Manali hotels drop 30–40% off rack rates in monsoon if you call. Aggregators rarely pass that on.
- **Lower Manali (Old Manali, Vashisht)** — more atmosphere, half the cost of Mall Road resorts.
- **Switch to Kasol or Tirthan** if Atal Tunnel is closed for two days. Both are within 3–4 hours and have excellent value stays.

## A safer 5-day plan

1. **Day 1 — Arrive, settle low.** Stay in Old Manali. Don't drive up the same day.
2. **Day 2 — Solang Valley + Atal Tunnel** *if open*. Otherwise, Naggar Castle + Roerich gallery (lovely in rain).
3. **Day 3 — Hadimba, Manu temple, Vashisht hot springs.** All low-altitude, all weather-safe.
4. **Day 4 — Day trip to Sissu (via Atal Tunnel) only if weather and BRO advisory both green.** Otherwise, do a riverside cafe day.
5. **Day 5 — Return.** Leave by 8 a.m. so you clear the slide-prone stretches in daylight.

## Three rules I never break

- Check **BRO Twitter (@BROindia)** the night before any high-altitude drive.
- Always have a **spare day** if the forecast shows three+ days of heavy rain that week.
- **Cabs > self-drive** in monsoon. Local drivers know which switchbacks flood first.

> The mountains aren't going anywhere. If something feels off — fog, a road that's running like a creek, a driver who's nervous — sleep there an extra night. It's the cheapest insurance you'll ever buy.
`,

'vande-bharat-vs-3ac': `
Pricing is the easy part of picking an Indian train — what's harder is
matching the class to the journey. A 6-hour Vande Bharat is a totally
different animal from a 14-hour 3AC. Here's a framework that goes beyond
"which is cheaper".

## Pick by **journey duration**, not by class name

- **Under 8 hours**: Vande Bharat or Tejas Chair Car wins almost every time. Faster, cleaner, food included, you don't need a berth.
- **8 – 14 hours, daytime**: Shatabdi or Vande Bharat if available. Otherwise AC Chair Car (CC).
- **8 – 14 hours, overnight**: AC 3-Tier (3A). You sleep, you save the cost of one hotel night.
- **More than 14 hours**: 3A or 2A. Sleeper class only if you genuinely enjoy long-haul travel — it's an experience, not a transport mode.

## The hidden cost of saving ₹500

Sleeper Class is half the price of 3A but has open windows, no charging,
and fans that work occasionally. For a single overnight, the math is:

- 3A: clean linen, decent sleep, you arrive functional.
- Sleeper: you arrive owing yourself a nap, possibly a shower.

The "savings" usually evaporate in a half-day of recovery time.

## Vande Bharat vs Tejas vs Shatabdi

| | Vande Bharat | Tejas | Shatabdi |
|--|--|--|--|
| Best for | New corridors, modern coaches | Mumbai–Goa, Delhi–Lucknow | Older corridors, more frequency |
| Speed | Fast | Fast | Moderate |
| Food | Included | Included | Included |
| Catch | Limited routes | Cancellation policies stricter | Older rakes on some routes |

If both Vande Bharat and Shatabdi run on your route, pick by departure
time — speed is similar, the difference is rake age.

## Practical playbook

- **Book on IRCTC, not aggregators.** Aggregators add ₹30–80 per ticket. IRCTC's own UI is fine now.
- **Tatkal at 10 a.m.** the day before for AC, **11 a.m.** for non-AC. Be in the app two minutes early.
- **PNR status** can change after charting (4 hours before departure). Don't panic at WL until then.
- **Side-lower in 3A** is the best berth for tall travellers. Side-upper for solo travellers wanting privacy.

> The right train class is the one that lets you walk off and start your trip — not the one that adds another half-day of recovery.
`,

'journey-mate-trip-comparison-philosophy': `
JourneyMate isn't a "best deals" app. It's a **decision-clarity** app.
Most travel software is built to maximise bookings; we're built to
maximise *good decisions* — even if that decision is "actually I don't
need to take this trip yet."

Here's the lens behind the product.

## Why two tiers and not five

We show exactly two — Silver and Gold — for one reason: *more options
make worse decisions*. The classic Iyengar jam-jar study showed that
shoppers who saw 24 jams bought less than shoppers who saw 6.

Every travel platform we've used pushes 30+ permutations and hopes the
user gives up and books anything. We picked two opinionated, fully
costed trips and asked: "Which of these *feels right* for this journey?"
That single question, well asked, is most of the value.

## Why "real prices" is the entire game

Indian travel is full of asterisk prices — the "starting from ₹2,499*"
that becomes ₹4,800 by checkout. We refuse to display teaser numbers.
Every fare on JourneyMate is a fully-loaded, this-is-what-you-pay
estimate based on:

- Actual class fare (not the cheapest possible)
- Realistic surge windows for the season
- Standard hotel rates with breakfast where applicable
- A ₹500–1,500 daily food estimate based on the city

If we don't know, we say "verify before booking" instead of inventing.

## Why we don't optimize for "lowest price"

The cheapest train class for a 22-hour journey isn't a good answer; it's
just a number. Our Silver tier is the **smart-budget** tier — the one
that gets you there well-rested and with budget left for the destination.

> Travelling badly to save 12% is a bad trade. Travelling well is the point.

## What we don't do

- We don't lock you in. Click "Book" and we hand you off to the actual operator.
- We don't ad-target. No "users like you also viewed" dark patterns.
- We don't bury cancellation policy. It's right there on the card.

This product is the answer to a specific question: *what would the trip
look like if a friend who's been there planned it?* We try to be that
friend, fairly priced, no asterisks.
`,

'kerala-backwaters-without-tourist-trap-spend': `
The Kerala backwaters routinely drain travellers' wallets on the wrong
things. Here's a clean spend plan — where to actually splurge, where the
tourist-trap markup hides, and how to enjoy the experience without
"package drama."

## The single biggest trap

Most operators bundle "1 night houseboat + 2 nights resort + airport
transfer + photos" at a price that looks reasonable until you back it
out. The houseboat is 35% of cost and 70% of the value. Everything else
is overpriced by 40–60%.

**Do this instead**: book the houseboat *direct* with a Kettuvallam
operator in Alleppey or Kumarakom (₹6,500–₹9,500 for a 1-night, 2-day
boat with full board), then book your resort separately on Booking.com
with refundable rates.

## Where to actually splurge

1. **The houseboat itself** — pay for a private double-bedroom boat with AC for the night portion. Open-deck-only boats are romantic in photos and miserable at 11 p.m. when the mosquitoes find you.
2. **One Sadya at Saravana Bhavan or Dwaraka** — proper banana-leaf meal, ₹350. Worth every rupee.
3. **A real Ayurveda session** at Somatheeram or Niraamaya, not a "spa massage." 90 minutes, ₹3,500–5,000, plan a slow afternoon around it.

## Where to save without compromising

- **Stay in Fort Kochi**, not on a Vembanad-lake resort. Half the price, better food, walkable.
- **Public boats** on the canals (₹50) instead of private hourly hire (₹1,500). The view is identical.
- **Train, not flight**, from south Indian cities. The Kerala train ride is part of the trip.

## A 4-day clean plan

1. **Day 1 — Fort Kochi**: arrive, walk Princess Street, Chinese fishing nets at sunset, dinner at Kashi Art Café.
2. **Day 2 — Houseboat day**: cab to Alleppey morning, board boat by noon, slow cruise, sunset on the deck, sleep on the lake.
3. **Day 3 — Disembark, Marari beach or back to Kochi**: the houseboat experience is one night; staying two is diminishing returns.
4. **Day 4 — Slow morning, depart**: a Sadya, a final coffee, train back.

> The point of the backwaters is to do almost nothing, very well. Spend on the parts of "almost nothing" that you'll remember.
`,

'india-visa-checklist-2026': `
Not glamorous — but the stuff that stops trips from going sideways.
Save this as a 10-minute pre-flight scan you do the day before *every*
domestic India trip. It's the boring checklist that prevents the
expensive surprise.

## The one-tab pre-flight check

### IDs

- **Aadhaar** in the m-Aadhaar app *and* the physical card. Some hotels still want a photocopy.
- **Driving License** if you'll rent a scooter. International License if you're a foreign national.
- **PAN card** for any high-value hotel deposit.

### Apps you actually need (download offline data while on Wi-Fi)

- **DigiLocker** — Aadhaar, License, Vehicle RC all signed and accepted at airports.
- **m-Aadhaar** — for ID at hotels and Indian Railways at counters.
- **IRCTC Rail Connect** — train tickets and PNR status without browser ads.
- **Google Maps** — *download the offline area* of your destination city before you fly.
- **Paytm or PhonePe** — UPI works at 90% of small operators now. Auto-rickshaw prices are 30% lower than tourist cab apps.

### Money

- **₹10,000–15,000 cash** for the trip — temples, dhabas, parking.
- **One credit card with no foreign-transaction fee** if your trip touches international segments.
- **Forex card** only for actual international legs; not needed for domestic India.

### Health basics (small kit, big peace of mind)

- ORS sachets (5)
- Paracetamol, Diclofenac, Imodium
- A strip of probiotics (works wonders in change-of-water territory)
- Mosquito repellent if you're going coastal or to the Northeast
- Sunscreen SPF 50+ if you're hill-bound or beach-bound

## Trip-specific add-ons

- **Hill stations**: a thin fleece + waterproof jacket, even in summer. Mountain weather changes by the hour.
- **Beach destinations**: a quick-dry towel, flip-flops you don't mind losing, a dry bag for the phone.
- **Temple towns**: cover-up scarves, slip-on shoes (footwear-off zones are everywhere).
- **Northeast permits**: Inner Line Permit for Arunachal/Mizoram/Nagaland. Apply online via the state portal at least 7 days out.

## The one-question test

Before you leave the door, answer this: *"If my phone battery dies right
now, can I still complete this trip?"* If the answer is "no," you're
under-prepared. Print or write down the hotel address, your PNR, and one
emergency contact.

> Trips don't go wrong because of the big things. They go wrong because
> of forgotten chargers, missing OTPs, and dead phones at the wrong
> moment. The boring checklist is the most romantic kind of preparation.
`,

}

module.exports = { BLOG_ARTICLE_BODIES }

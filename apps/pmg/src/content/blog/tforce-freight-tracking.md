---
title: "How to Track a TForce Freight Shipment (PRO or BOL)"
description: "Track TForce Freight with a PRO or BOL number, find your PRO on the paperwork, read the scan statuses, and know what to do when tracking stops updating."
pubDate: 2026-09-07
heroImage: /images/blog/tforce-freight-tracking.svg
heroAlt: "A freight bill of lading with the PRO number highlighted, next to a tracking status list"
keyword: "tforce freight tracking"
keywords:
  - "tforce tracking"
  - "tforce tracker"
  - "tforce pro number"
  - "tforce bol tracking"
  - "upgf tracking"
  - "tforce pickup request"
  - "tforce freight customer service"
category: "LTL"
faq:
  - q: "How do I track a TForce Freight shipment?"
    a: "Enter your PRO number on the TForce Freight tracking page at tforcefreight.com. You can track by PRO number, BOL number, or by a shipper or purchase order reference if one was recorded when the shipment was booked."
  - q: "What is a TForce PRO number?"
    a: "A PRO number (short for progressive number) is the carrier's own tracking number for an LTL shipment. TForce PRO numbers are typically nine or ten digits and appear on the bill of lading and the pickup receipt."
  - q: "Why does my paperwork say UPGF or UPS Freight?"
    a: "UPGF was the SCAC code assigned to UPS Ground Freight. TFI International bought UPS Freight in 2021 and rebranded it TForce Freight, but older paperwork, TMS entries and routing guides still carry the UPGF code and the UPS Freight name."
  - q: "What do I do if TForce tracking has not updated?"
    a: "A gap of a day or two mid-transit is normal, because LTL freight only scans at terminal events rather than continuously. If there has been no scan for more than two business days, or the delivery date has passed, call TForce with the PRO number and ask them to trace it."
---

To track a TForce Freight shipment, enter your PRO number on the [TForce Freight tracking page](https://www.tforcefreight.com/ltl/apps/Tracking). You can also track by BOL number or by a shipper or purchase order reference, provided that reference was recorded when the shipment was booked.

LTL tracking does not work like a parcel tracking number. There is no continuous GPS trail — your freight scans when it hits a terminal event, and the gaps between those events are normal. Knowing which number to use and how to read the scans is most of the battle.

## How do you track a TForce Freight shipment?

Go to the TForce Freight tracking tool, choose the number type you have, and enter it. The tool accepts PRO numbers, BOL numbers, and shipper or PO references, and will accept several PRO numbers at once if you are checking a batch.

In practice:

1. **Find your PRO number** on the bill of lading or the pickup receipt. This is the fastest and most reliable option.
2. **Enter it on the tracking page.** Multiple PROs can be pasted in together.
3. **Read the most recent scan**, not just the status headline. The terminal location tells you more than the word "in transit" does.
4. **Check the estimated delivery date** against what you were quoted at booking. LTL transit times are business days and exclude weekends and holidays.

If you have no PRO number at all, whoever arranged the shipment does. For a collect shipment that is the shipper; for a prepaid shipment it is usually your own shipping desk or your broker.

## Where do you find your TForce PRO number?

Your PRO number is on the bill of lading and on the pickup receipt the driver leaves behind. It is normally a nine or ten digit number, often printed with a barcode and labelled "PRO" or "PRO number."

The usual places to look, in order:

- **The bill of lading (BOL).** Top right on most formats.
- **The pickup receipt** signed by the driver at collection.
- **Your booking confirmation email**, if the shipment was tendered electronically.
- **Your TMS or shipping software**, under the shipment record.
- **The supplier**, if the freight is inbound and someone else arranged it.

"PRO" is short for *progressive number*. Every LTL carrier issues its own, so a PRO number from one carrier means nothing to another.

## Can you track TForce Freight by BOL number instead?

Yes. The TForce tracking tool accepts BOL numbers as well as PRO numbers, which is useful when you are the consignee and the shipper has sent you paperwork but not the carrier's own tracking number.

The trade-off is precision. A PRO number identifies exactly one shipment on the carrier's system. A BOL number is your document reference, and if it was keyed inconsistently at booking, the lookup can miss. If a BOL search returns nothing and you are certain the shipment exists, get the PRO from the shipper rather than assuming the freight has gone astray.

## Why does my paperwork say UPGF or UPS Freight?

Because TForce Freight used to be UPS Freight. TFI International agreed to buy the business from UPS in January 2021 for $800 million, closed the deal that April, and completed the rebrand to TForce Freight later that year.

UPGF was the SCAC code assigned to UPS Ground Freight, the entity that ran the business from 2006. Old routing guides, TMS carrier records, customer master files and pre-printed BOL templates still carry it, which is why people search "UPGF tracking" and land on TForce. If your paperwork shows UPGF or UPS Freight, it is the same carrier — track it as TForce.

This is worth cleaning up in your own systems. A stale SCAC in a routing guide is the kind of small data problem that causes shipments to be tendered incorrectly, and misrouted freight is expensive in ways that never show up as a line item.

## What do the TForce tracking statuses mean?

The status tells you which terminal event happened last, not where the truck is right now. LTL freight moves through a hub network, so a shipment can sit at a terminal overnight in perfectly normal operation.

Reading the common ones:

- **Picked up.** The driver has collected the freight and it is on the way to the origin terminal.
- **In transit.** It is moving between terminals. Expect gaps of a day or more between scans on a long lane; this is the network working, not a problem.
- **At destination terminal.** It has arrived in the delivery city and is waiting to be assigned to a local delivery route.
- **Out for delivery.** On a truck today.
- **Delivered.** Look for the signature name and timestamp. If you need proof of delivery for a claim, request the signed delivery receipt rather than relying on the web status.
- **Exception or attempted.** Something blocked delivery — no one at the dock, a limited-access location, an appointment not made, or a refusal. These need a phone call, not another refresh.

## What do you do when TForce tracking has not updated?

Give it two business days. Beyond that, or if the estimated delivery date has passed with no movement, call TForce with the PRO number and ask for a formal trace rather than waiting for the website to change.

A useful sequence:

1. **Confirm the PRO is right.** A transposed digit returns a valid-looking dead end far more often than freight actually goes missing.
2. **Check for an appointment requirement.** Residential, limited-access and by-appointment consignees stall silently until someone books the delivery.
3. **Call and open a trace** with the PRO number, the pickup date, the origin and destination ZIPs, and the piece and weight count.
4. **Ask for the terminal**, not the call centre, once a trace is open. The destination terminal knows whether the freight is physically on their dock.
5. **Document everything.** If this becomes a claim, the trace reference and the dates matter.

## How do you request a TForce Freight pickup?

Pickups are requested through the TForce Freight website, through your TMS if it is integrated, or by phone. You will need the origin address, the ready time and dock close time, and the piece count, weight and freight class.

The detail that most often causes a missed pickup is the ready-time window. A driver dispatched to a location that closes at 3pm will not wait, and a pickup that fails at 4pm on a Friday costs you the whole weekend. Give a window you can actually hold, and make sure whoever is on the dock knows the freight is going.

## When tracking is the symptom, not the problem

If you are checking tracking constantly, that is usually a sign of something upstream: transit times that do not match what was promised, carriers chosen on rate alone for lanes they are weak on, or no one watching the shipments until a customer calls.

Parcel Management Group runs [LTL and full truckload dispatch](/#services) with a team that watches the freight instead of leaving you to refresh a tracking page. If you also ship small package, the same discipline applies to your invoices — see [what a parcel audit is](/blog/what-is-a-parcel-audit/) and [how to reduce shipping costs at volume](/blog/reduce-shipping-costs-high-volume/).

---

**Sources:** [TForce Freight tracking](https://www.tforcefreight.com/ltl/apps/Tracking) · [TFI International's acquisition of UPS Freight, 2021](https://en.wikipedia.org/wiki/TForce_Freight)

---
title: "How to Write a Shipping Address (and Avoid Correction Fees)"
description: "The correct US shipping address format, what the shipper address means, how to use c/o and attention lines, and why address errors trigger carrier correction fees."
pubDate: 2026-09-07
heroImage: /images/blog/how-to-write-a-shipping-address.svg
heroAlt: "A shipping label with the recipient address block laid out line by line"
keyword: "how to write an address for shipping"
keywords:
  - "how to write a shipping address"
  - "shipper address"
  - "care of shipping"
  - "shipping address format"
  - "c/o meaning on address"
  - "attention line shipping label"
category: "Small Package"
faq:
  - q: "How do you write a shipping address?"
    a: "Write it in four lines: recipient name, then any attention or c/o line, then the street address with unit or suite number, then city, two-letter state abbreviation and ZIP code. Put the country on its own final line for international shipments."
  - q: "What does the shipper address mean?"
    a: "The shipper address is the origin address on a shipping label or bill of lading: where the shipment is collected from and where it returns if it cannot be delivered. It is distinct from the bill-to address, which is who pays."
  - q: "What does c/o mean on a shipping address?"
    a: "C/o means care of. It routes a package to a recipient at an address that is not their own, such as a guest at a business or a person at a third-party warehouse. It goes on its own line directly below the recipient name."
  - q: "Why do carriers charge address correction fees?"
    a: "When an address is incomplete, misformatted or does not match the carrier's address database, the carrier corrects it manually and bills an address correction fee. These are recoverable when the address was correct as tendered, which is one of the things a parcel audit checks."
---

Write a shipping address in four lines: the recipient's name, then any attention or c/o line, then the street address including unit or suite number, then the city, two-letter state abbreviation and ZIP code. International shipments add the country on its own final line, in capitals.

It looks trivial. It is not — carriers bill an address correction fee every time they have to fix one, and those fees are among the most common charges on a small-package invoice.

## What is the correct format for a US shipping address?

The US format runs from most specific to least specific, top to bottom, with the city, state and ZIP on a single final line. Everything is left-aligned and capitalisation is your choice, though all-caps is what the postal standard prefers for machine reading.

```
JANE OKONKWO
ATTN: RECEIVING
1420 HARBOR BLVD STE 300
OXNARD CA 93035
```

Line by line:

1. **Recipient name.** A person, a company, or both — company on the line above the street if the person is the contact.
2. **Attention or c/o line.** Optional. Directs the package inside a building or to a person at someone else's address.
3. **Street address.** Number, street name, and the unit, suite or apartment on the *same* line where it fits.
4. **City, state, ZIP.** Two-letter state abbreviation. ZIP+4 if you have it, which improves sortation.

Two habits that prevent most problems: put the suite or unit number on the street line rather than its own line, and use the standard abbreviations (STE, APT, BLVD, AVE) rather than spelling them out inconsistently.

## What does the shipper address mean?

The shipper address is the origin — where the shipment is collected and where it goes back if it cannot be delivered. On a label it is the "from" block; on a bill of lading it is the shipper or consignor.

It is not the same as the bill-to address, and conflating them causes real problems. Three addresses can all be different on one shipment:

- **Shipper address.** Where the freight physically originates, and the return destination on an undeliverable.
- **Consignee address.** Where it is going.
- **Bill-to address.** Who is invoiced. Often a head office that never sees the freight.

If your returns are going to the wrong place, or invoices are landing at a warehouse instead of accounts payable, this is usually where it starts.

## What does "care of" (c/o) mean on a shipping address?

C/o means *care of*. It tells the carrier to deliver to a recipient at an address that is not their own — a person staying at a business, an employee at a shared office, or goods held at a third-party warehouse.

It goes on its own line, directly below the recipient's name and above the street address:

```
DANIEL REYES
C/O NORTHSIDE LOGISTICS
88 COMMERCE WAY
GREENEVILLE TN 37745
```

Read that as: deliver to Northside Logistics, where Daniel Reyes will receive it. The name on the top line is who the package is for; the c/o line is who is accepting it on their behalf. Use "ATTN:" instead when the recipient genuinely works at that address and you are just routing it to the right desk or department.

## How do you write an address for a business delivery?

Put the company name on its own line, the contact person on an attention line, and the suite or dock number on the street line. Business deliveries fail on the inside of the building far more often than they fail on the street.

```
GAZELLE SPORTS
ATTN: RECEIVING DOCK B
3517 EAST CENTRE AVE STE 12
PORTAGE MI 49002
```

Worth getting right because it directly affects cost: a commercial address that the carrier classifies as residential attracts a residential surcharge on every shipment to it. That misclassification is the carrier's call, it is frequently wrong, and it is recoverable — see [what a parcel audit is](/blog/what-is-a-parcel-audit/).

## Why do address errors cost money?

Because carriers charge for fixing them. When an address is incomplete, misformatted, or does not match the carrier's address database, the carrier corrects it manually and bills an address correction fee — one of the highest-frequency accessorial charges on a typical small-package invoice.

The usual triggers:

- **Missing unit, suite or apartment number** on a multi-tenant address.
- **Wrong or missing ZIP**, or a ZIP that does not match the city.
- **Street type errors** — Avenue where it should be Street, or a directional prefix dropped.
- **A PO box** on a service that cannot deliver to one.
- **Business name only**, with no street address the carrier's database recognises.

Two of these are worth separating. A genuinely wrong address is your problem, and the fix is address validation at order entry rather than at the shipping station. But a *correct* address that the carrier flagged anyway is a billing error, and it is refundable if someone disputes it inside the carrier's window — which almost nobody does, because it means checking every invoice line against the address that was actually tendered.

## Fixing it upstream

Address correction fees are a symptom of a data problem, not a shipping problem. They are cheapest to fix where the address is captured — validating at order entry, requiring a unit number on multi-tenant addresses, and standardising abbreviations — rather than at the label.

Everything the validation misses still lands on your invoice, and that portion is recoverable. Parcel Management Group's [Small Package Program](/#services) audits UPS and FedEx accounts for exactly these charges, and it costs your business nothing: no fees, no contract. See also [how to reduce shipping costs at volume](/blog/reduce-shipping-costs-high-volume/).

---

**Sources:** [USPS Postal Addressing Standards (Publication 28)](https://pe.usps.com/text/pub28/welcome.htm)

// Public reviews shown on the home page. Google reviews are pulled from the
// Google Business Profile through Windsor.ai (location 2881403402914855967)
// and pasted here verbatim. Re-pull and update when new reviews land.
// Last pulled: 2026-10-02.
// Counts show once they're big enough to help. Under this, the site says
// "Rated 5.0 on Google" and "Recommended on Facebook" with no number.
export const SHOW_COUNT_FROM = 10;

export const googleReviews = {
  rating: 5.0,
  count: 2,
  profileHref: 'https://maps.google.com/maps?cid=11942583771113823781',
  writeHref: 'https://search.google.com/local/writereview?placeid=ChIJ2RoTnPU2eGIRJZ6VUaqUvKU',
  items: [
    {
      name: 'Mat S.',
      stars: 5,
      date: '2026-07-05',
      text: 'Very satisfied with my service, got tons of leads with it!',
    },
    {
      name: 'Edgar Aguirre',
      stars: 5,
      date: '2026-07-05',
      text: 'Very satisfied with the marketing great team',
    },
  ],
};

// Facebook recommendations, copied from the page's Reviews tab (Facebook has
// no star ratings, only "recommends"). Last checked: 2026-10-02.
export const facebookReviews = {
  count: 3,
  profileHref: 'https://www.facebook.com/profile.php?id=61590635130563&sk=reviews',
  items: [
    {
      name: 'Parcel Management Group',
      date: '2026-08-05',
      text: 'Great Service. They do my meta ads, google ads, seo and geo, and manage my leads!',
      href: '/work/parcel-management-group',
    },
    {
      name: 'Wicked Logistics',
      date: '2026-06-09',
      text: 'They did all of our social media management, set up our website, and optimized everything. We get 5-6 calls and multiple emails a day for shipments!',
      href: '/work/wicked-logistics',
    },
    {
      name: 'OnlyFish',
      date: '2026-06-09',
      text: 'When we were in business Dead River Management made our website and helped set up our social media! They ran Google ads and made everything smooth',
      href: '/work/only-fish',
    },
  ],
};

// Public reviews shown on the home page. Google reviews are pulled from the
// Google Business Profile through Windsor.ai (location 2881403402914855967)
// and pasted here verbatim. Re-pull and update when new reviews land.
// Last pulled: 2026-10-02.
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

// Facebook recommendations are not available through our connectors, so the
// page links out instead of quoting a number we cannot verify.
export const facebookReviewsHref = 'https://www.facebook.com/profile.php?id=61590635130563&sk=reviews';

// The site's navigation architecture, transcribed VERBATIM from the source
// header (audit/raw/*.html, <header id="masterhead">). Labels and hrefs are the
// live site's own — nothing here is invented, reordered or reworded.

export const TOPBAR = {
  note: 'Clear Lake since 1984 · Most vision &amp; medical plans accepted',
  hours: 'Mon/Tue/Thu/Fri 9:30&nbsp;AM&ndash;6:30&nbsp;PM · Sat 9&nbsp;AM&ndash;1&nbsp;PM',
  phoneLabel: 'Call (281) 488-0066',
  phoneHref: 'tel:+12814880066',
};

export const BRAND = {
  name: 'Eye Trends',
  sub: 'Vision &amp; Glasses Center',
  logo: '/assets/img/eye-trends-vision-and-glasses-center.webp',
  logoAlt: 'Eye Trends Vision And Glasses Center',
};

export const SERVICE_COLUMNS = [
  { head: { label: 'Comprehensive Exams', href: '/services/comprehensive-eye-exams' }, links: [
    { label: 'Adult Eye Exams', href: '/services/adult-eye-exams' },
    { label: 'Senior Eye Exams', href: '/services/senior-eye-exams' },
  ] },
  { head: { label: "Children's Eye Care", href: '/services/childrens-eye-care' }, links: [
    { label: 'Pediatric Eye Exams', href: '/services/pediatric-eye-exams' },
    { label: "Children's Contact Lenses", href: '/services/childrens-contact-lenses' },
    { label: 'Back-to-School Eye Exams', href: '/services/back-to-school-eye-exams' },
    { label: 'Myopia Management', href: '/services/myopia-management' },
  ] },
  { head: { label: 'Medical Eye Care', href: '/services/medical-eye-care' }, links: [
    { label: 'Dry Eye Treatment', href: '/services/dry-eye-treatment' },
    { label: 'Glaucoma Management', href: '/services/glaucoma-management' },
    { label: 'Diabetic Eye Exams', href: '/services/diabetic-eye-exams' },
    { label: 'Macular Degeneration', href: '/services/macular-degeneration' },
    { label: 'Cataract Co-Management', href: '/services/cataract-co-management' },
    { label: 'LASIK Co-Management', href: '/services/lasik-co-management' },
  ] },
  { head: { label: 'Emergency Eye Care', href: '/services/emergency-eye-care' }, links: [
    { label: 'Pink Eye Treatment', href: '/services/pink-eye-conjunctivitis' },
    { label: 'Foreign Body Removal', href: '/services/foreign-body-removal' },
    { label: 'Red / Sore Eye Treatment', href: '/services/red-eye-treatment' },
    { label: 'Flashes &amp; Floaters', href: '/services/flashes-floaters' },
  ] },
  { head: { label: 'Contact Lens Exams', href: '/services/contact-lens-exams' }, links: [
    { label: 'Same-Day Contacts', href: '/services/same-day-contacts' },
    { label: 'Specialty Contacts', href: '/services/specialty-contacts' },
    { label: 'Toric Contacts', href: '/services/toric-contacts' },
    { label: 'Gas Permeable Contacts', href: '/services/gas-permeable-contacts' },
    { label: 'Multifocal Contacts', href: '/services/multifocal-contacts' },
  ] },
];

export const EYEWEAR_CARDS = [
  { label: 'Designer Frames', href: '/products/designer-frames', blurb: 'Independent-optical and luxury names, measured and fitted in person.' },
  { label: 'Sunglasses', href: '/products/sunglasses', blurb: 'Prescription and designer tints, polarized and driving lenses.' },
  { label: "Kids' Eyewear", href: '/products/kids-eyewear', blurb: 'Durable frames sized and fitted for growing faces.' },
  { label: 'Contact Lenses', href: '/products/contact-lenses', blurb: 'Fittings for soft, toric, multifocal and gas permeable lenses.' },
];

export const PROMO_SERVICES = {
  eyebrow: 'Eye Care',
  h: 'Comprehensive &amp; medical eye care',
  p: 'Routine eye exams, medical eye care and urgent visits, all in Clear Lake.',
  cta: 'Book an Eye Exam',
};

export const PROMO_EYEWEAR = {
  eyebrow: 'Eyewear &amp; Contacts',
  h: 'Designer frames, fitted right',
  p: 'Designer frames, sunglasses and contact lenses, measured and fitted in person by your doctor.',
  cta: 'Schedule an Eye Exam',
};

export const PRIMARY = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/our-doctor' },
  { label: 'Services', href: '/services', mega: 'services' },
  { label: 'Eyewear', href: '/products', mega: 'eyewear' },
  { label: 'Insurance', href: '/insurance' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Visit Us', href: '/eye-doctor-clear-lake' },
];

export const FOOTER_COLUMNS = [
  { head: 'Eye Care Services', links: [
    { label: 'Comprehensive Exams', href: '/services/comprehensive-eye-exams' },
    { label: "Children's Eye Care", href: '/services/childrens-eye-care' },
    { label: 'Medical Eye Care', href: '/services/medical-eye-care' },
    { label: 'Emergency Eye Care', href: '/services/emergency-eye-care' },
    { label: 'Contact Lens Exams', href: '/services/contact-lens-exams' },
  ] },
  { head: 'Eyewear', links: [
    { label: 'Designer Frames', href: '/products/designer-frames' },
    { label: 'Sunglasses', href: '/products/sunglasses' },
    { label: "Kids' Eyewear", href: '/products/kids-eyewear' },
    { label: 'Contact Lenses', href: '/products/contact-lenses' },
  ] },
  { head: 'Practice', links: [
    { label: 'Our Doctor', href: '/our-doctor' },
    { label: 'Insurance &amp; Payment', href: '/insurance' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Eye Health', href: '/eye-health' },
    { label: 'Patient Forms', href: '/patient-forms' },
  ] },
];

export const FOOTER_VISIT = {
  head: 'Visit',
  address1: '515 Bay Area Blvd #300',
  address2: 'Houston, TX 77058',
  hours: 'Mon/Tue/Thu/Fri 9:30 AM&ndash;6:30 PM · Wed closed · Sat 9 AM&ndash;1 PM · Sun closed',
  phoneLabel: '(281) 488-0066',
  phoneHref: 'tel:+12814880066',
  links: [
    { label: 'Hours &amp; Location', href: '/eye-doctor-clear-lake' },
    { label: 'Book an Appointment', href: '#book' },
  ],
};

export const FOOTER_BRAND = {
  name: 'Eye Trends',
  blurb: 'Vision &amp; Glasses Center. <a href="/our-doctor">Dr. Jerry Hyder, OD</a>, a licensed therapeutic optometrist caring for Clear Lake families since 1984. Eye exams, medical eye care, contact lenses and eyewear.',
};

export const FOOTER_PRECTA = {
  eyebrow: 'Ready when you are',
  h: 'Book your eye exam in Clear Lake',
  p: "Book online in a minute, or call and talk to a real person. We'll find a time that works, and most vision and medical plans are accepted.",
  cta: 'Book an Eye Exam',
  phoneLabel: 'Call (281) 488-0066',
  meta: '515 Bay Area Blvd #300, Houston TX 77058 · Mon/Tue/Thu/Fri 9:30&nbsp;AM&ndash;6:30&nbsp;PM · Sat 9&nbsp;AM&ndash;1&nbsp;PM',
};

export const FOOTER_LEGAL = {
  copyright: '© 2026 Eye Trends Vision &amp; Glasses Center. All rights reserved.',
  links: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
};

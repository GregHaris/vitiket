export const headerLinks = [
  {
    label: 'Home',
    route: '/',
  },
  {
    label: 'Create Event',
    route: '/events/create',
  },
  {
    label: 'Dashboard',
    route: '/dashboard',
  },  {
    label: 'Admin',
    route: '/admin',
  },
];

export const heroContent = [
  {
    title:
      'From Blockchain to AI, and Beyond.\nYour Passport to Tech Innovation.',
    cta: 'Explore Tech Events',
    backgroundImage: '/assets/images/hero1.png?height=800&width=1200',
  },
  {
    title: 'Connect, Learn, and Grow.\nFind Your Tribe at the Next Tech Event.',
    cta: 'Explore events',
    backgroundImage: '/assets/images/hero3.png?height=800&width=1200',
  },
  {
    title:
      'Navigate the Future of Tech.\nYour Gateway to the Best Tech Events.',
    cta: 'Discover Tech Events',
    backgroundImage: '/assets/images/hero4.png?height=800&width=1200',
  },
  {
    title: 'Participate or Learn from Anywhere.',
    cta: 'Explore Virtual Events',
    backgroundImage: '/assets/images/hero5.png?height=800&width=1200',
  },
];

export const eventDefaultValues = {
  title: '',
  description: '',
  location: '',
  imageUrl: '',
  startDateTime: new Date(),
  endDateTime: new Date(),
  categoryId: '',
  price: '',
  currency: 'NGN',
  isFree: false,
  url: '',
  contactDetails: {
    phoneNumber: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    x: '',
  },
};

export const currencies = ['NGN', 'USD', 'EUR'];

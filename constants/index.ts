export const headerLinks = [
  {
    label: 'Explore Events',
    route: '/events',
  },
  {
    label: 'Create Event',
    route: '/events/create',
  },
  {
    label: 'Dashboard',
    route: '/dashboard',
  },
];

export const heroContent = [
  {
    title:
      'From Blockchain to AI, and Beyond.\nYour Passport to Tech Innovation.',
    cta: 'Explore Events',
    backgroundImage: '/assets/images/hero1.png?height=800&width=1200',
  },
  {
    title: 'Connect, Learn, and Grow.\nFind Your Tribe at the Next Tech Event.',
    cta: 'Explore Events',
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
  subtitle: '',
  description: '',
  locationType: 'Virtual' as 'Virtual',
  location: '',
  coordinates: '',
  imageUrl: '',
  startDate: new Date(),
  endDate: new Date(),
  startTime: new Date(),
  endTime: new Date(),
  typeId: '',
  categoryId: '',
  priceCategories: [],
  quantity: null,
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

export const currencySymbols = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
} as const;

export const predefinedCategories = {
  Virtual: ['General Admission', 'Early Bird', 'Regular', 'VIP', 'Other'],
  Physical: ['General Admission', 'Early Bird', 'Regular', 'VIP', 'Other'],
  Hybrid: [
    'General Admission',
    'Virtual',
    'Physical Attendance',
    'Early Bird',
    'Regular',
    'VIP',
    'Other',
  ],
};

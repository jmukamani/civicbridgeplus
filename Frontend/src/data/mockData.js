export const policies = [
  {
    id: 1,
    title: 'Public Health Bill',
    status: 'Active',
    comments: 120,
    lastUpdated: '2 days ago',
    description: 'Comprehensive healthcare reform focusing on universal access and quality improvements.',
    keyPoints: [
      'Improved access to services for all citizens',
      'Enhanced quality standards and regulations',
      'Sustainable funding mechanisms',
      'Community participation and feedback integration'
    ],
    feedback: [
      {
        text: "This policy addresses critical needs in our community. I support the proposed changes.",
        author: "Mary K., Nairobi East"
      },
      {
        text: "More consultation needed with rural communities before implementation.",
        author: "John M., Turkana"
      }
    ]
  },
  {
    id: 2,
    title: 'Education Reform',
    status: 'Draft',
    comments: 85,
    lastUpdated: '5 days ago',
    description: 'Proposed changes to the national education curriculum and funding structure.',
    keyPoints: [
      'Updated curriculum for modern skills',
      'Increased funding for rural schools',
      'Teacher training and development programs',
      'Technology integration in classrooms'
    ],
    feedback: []
  },
  {
    id: 3,
    title: 'Green Energy Act',
    status: 'Active',
    comments: 200,
    lastUpdated: '1 day ago',
    description: 'Legislative framework for renewable energy adoption and environmental protection.',
    keyPoints: [
      'Incentives for renewable energy adoption',
      'Environmental protection measures',
      'Job creation in green sectors',
      'Carbon emission reduction targets'
    ],
    feedback: []
  }
];

export const representatives = [
  { 
    id: 1, 
    name: 'Rep. Otieno', 
    constituency: 'Nairobi East', 
    party: 'ODM', 
    avatar: '👨‍💼',
    county: 'Nairobi'
  },
  { 
    id: 2, 
    name: 'Sen. Wanjiku', 
    county: 'Nairobi', 
    party: 'UDA', 
    avatar: '👩‍💼'
  }
];

export const counties = [
  'Nairobi', 'Kiambu', 'Machakos', 'Kajiado', 'Murang\'a', 
  'Turkana', 'Mombasa', 'Kisumu'
];

export const constituencies = {
  'Nairobi': ['Nairobi East', 'Nairobi West', 'Nairobi North', 'Nairobi South'],
  'Kiambu': ['Kiambu Town', 'Ruiru', 'Thika Town', 'Limuru'],
  'Machakos': ['Machakos Town', 'Mavoko', 'Masinga', 'Yatta'],
  'Kajiado': ['Kajiado Central', 'Kajiado East', 'Kajiado North', 'Kajiado South'],
  'Murang\'a': ['Kiharu', 'Kandara', 'Gatanga', 'Kigumo']
};

export const activityData = [
  {
    id: 1,
    type: 'message',
    title: 'Message from Rep. Otieno',
    subtitle: 'Today • 1 new message',
    avatar: '👨‍💼'
  },
  {
    id: 2,
    type: 'poll',
    title: 'Participated in Health Policy Poll',
    subtitle: 'Yesterday',
    avatar: null
  }
];

export const policyCategories = [
  'Health', 'Education', 'Energy', 'Water', 'Infrastructure', 
  'Safety', 'Agriculture', 'Technology', 'Trade', 'Youth', 
  'Women', 'Environment'
];

export const engagementTrends = [
  { month: 'Jan', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 48 },
  { month: 'Apr', value: 61 },
  { month: 'May', value: 55 },
  { month: 'Jun', value: 67 },
  { month: 'Jul', value: 70 },
  { month: 'Aug', value: 63 },
  { month: 'Sep', value: 58 },
  { month: 'Oct', value: 72 },
  { month: 'Nov', value: 69 },
  { month: 'Dec', value: 75 }
];
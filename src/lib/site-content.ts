/**
 * All copy below comes from the client's Canva reference.
 * Nothing here is invented — placeholders are marked where content is missing.
 * WordPress migration: these arrays map 1:1 to ACF repeaters / CPT entries.
 */

export const site = {
  name: "Turtle Wings",
  tagline: "Dedicated To Autism",
  headline: "Special Education Center for Children with Diverse Needs",
  subheadline: "Transforming After-School Hours into Meaningful Learning",
  program: "Evening Group Program | 5:00 PM – 7:00 PM",
  locationShort: "Electronic City, Phase - 2, Bengaluru",
  address: [
    "Turtle Wings",
    "Hall #3, Club House,",
    "Concorder Wish Rush Apartments,",
    "Electronic City, Phase - 2,",
    "Bengaluru, Karnataka",
  ],
  phone: "+91 9620135222",
  phoneHref: "tel:+919620135222",
  whatsapp: "+91 9620135222",
  whatsappHref: "https://wa.me/919620135222",
  email: "turtlewingsbangalore@gmail.com",
  founderEmail: "neha4autism@gmail.com",
  website: "www.turtlewings.in",
  timings: "Monday – Friday: 5:00 PM – 7:00 PM",
  closed: "Closed: Saturdays, Sundays & Public/Bank Holidays",
  /** Keyless Google Maps embed for the centre (overridable in Admin → Settings). */
  mapEmbedUrl:
    "https://www.google.com/maps?q=" +
    encodeURIComponent(
      "Hall No 3, Concorde Clubhouse, near Concorde Sylvan View, Concorde Wind Rush Apartment, Singena Agrahara, Andapura, Karnataka 560099",
    ) +
    "&output=embed",
  mapLinkUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      "Hall No 3, Concorde Clubhouse, near Concorde Sylvan View, Concorde Wind Rush Apartment, Singena Agrahara, Andapura, Karnataka 560099",
    ),
} as const;

export const whoWeAre = [
  "Turtle Wings is a special education centre supporting children with Autism Spectrum Disorder.",
  "Our structured group program combines movement, play, communication, sensory experiences, and foundational academics to help children learn in a way that is enjoyable, predictable, and suited to their individual strengths.",
  "Every session is carefully planned to support not just academic learning, but the overall development of the child.",
];

export const founder = {
  name: "Neha Choudhary",
  role: "Founder · RCI Certified Special Educator (Autism)",
  email: site.founderEmail,
  paragraphs: [
    "Before entering the field of special education, I spent several years working in the corporate world, building my career in sales and business development. Those years taught me the importance of communication, discipline, planning, and building meaningful relationships.",
    "Life then took me in a different direction. As a parent of a child with autism, I found myself learning, unlearning, and understanding the world of special education in a way I had never imagined. What began as a personal journey to support my own child gradually became a professional calling.",
    "Over the years, I pursued formal qualifications as an RCI Certified Special Educator (Autism) and continued to deepen my knowledge through specialized training in areas such as Specific Learning Disabilities (SLD), AAC, and Primitive Reflex Integration. Every course I completed had one purpose—to become better equipped to support children and their families.",
    "Turtle Wings is an extension of that journey. It is a place where I hope to create structured, meaningful learning opportunities not only for my own son, but also for many other children with autism. My vision is to build a supportive environment where children can learn with confidence, parents feel understood, and every small step of progress is valued.",
  ],
};

export const whyChooseUs = [
  {
    title: "Autism-Focused Learning",
    body: "Everything we do is designed specifically for children with Autism Spectrum Disorder.",
    icon: "puzzle",
  },
  {
    title: "Family Partnership",
    body: "We believe parents are an important part of every child's progress.",
    icon: "users",
  },
  {
    title: "Learning Through Play",
    body: "Children learn through movement, games, stories, art, sensory experiences, and structured activities.",
    icon: "blocks",
  },
  {
    title: "Parent's Perspective",
    body: "Being a parent of a child with autism gives us a deeper understanding of the family's journey.",
    icon: "heart",
  },
  {
    title: "Beyond Academics",
    body: "We nurture communication, independence, confidence, emotional regulation, and social skills alongside academics.",
    icon: "sparkles",
  },
  {
    title: "Qualified Leadership",
    body: "The program is led by an RCI Certified Special Educator with specialized training in autism.",
    icon: "award",
  },
  {
    title: "Structured Routine",
    body: "Predictable routines help children feel secure, confident, and ready to learn.",
    icon: "calendar",
  },
] as const;

export const programFacts = [
  { label: "Age Group", value: "3–10 years" },
  { label: "Timing", value: "5:00 PM – 7:00 PM" },
  { label: "Batch", value: "Small Group" },
  { label: "Seats", value: "Limited Seats" },
];

export const programObjectives = [
  "Communication Skills",
  "School Readiness",
  "Attention & Concentration",
  "Listening Skills",
  "Emotional Regulation",
  "Fine Motor Skills",
  "Gross Motor Skills",
  "Functional Academics",
  "Independence",
  "Confidence",
];

export const learningDomains = [
  {
    title: "Physical Development",
    body: "Activities that improve balance, coordination, body awareness, posture, strength, and motor planning.",
  },
  {
    title: "Cognitive Skills & Visual Perception",
    body: "Visual perception, attention, memory, sequencing, problem-solving, and thinking activities.",
  },
  {
    title: "English & Language Development",
    body: "Building vocabulary, listening skills, phonics, early reading, communication, comprehension, and expressive language through structured activities.",
  },
  {
    title: "Sensory Development",
    body: "Sensory play and sensory regulation activities that help children explore, organise, and respond to their environment more effectively.",
  },
  {
    title: "Art & Craft",
    body: "Creative activities that encourage imagination while strengthening fine motor skills, hand-eye coordination, focus, and self-expression.",
  },
  {
    title: "General Awareness",
    body: "Helping children understand themselves and the world around them through themes such as family, community, nature, daily routines, and life skills.",
  },
  {
    title: "Play & Social Skills",
    body: "Structured play that encourages communication, sharing, turn-taking, cooperation, emotional understanding, and friendships.",
  },
  {
    title: "Music & Mantra Chanting",
    body: "A calming conclusion to each session through music, rhythm, breathing, and simple mantra chanting to promote relaxation, attention, and emotional regulation.",
  },
  {
    title: "Mathematics Readiness",
    body: "Developing number concepts, counting, patterns, reasoning, and foundational mathematical skills through hands-on learning.",
  },
];

export const faqs = [
  {
    q: "What is Turtle Wings?",
    a: "Turtle Wings is a special education centre in Electronic City, Bengaluru, offering a structured Evening Group Program for children with Autism Spectrum Disorder.",
  },
  {
    q: "Who can join the Evening Group Program?",
    a: "The program is designed for children with Autism Spectrum Disorder between 3 and 10 years of age.",
  },
  {
    q: "What are the class timings and days?",
    a: "The Evening Group Program is conducted Monday to Friday from 5:00 PM to 7:00 PM. The centre remains closed on Saturdays, Sundays, and all declared public/bank holidays.",
  },
  {
    q: "How many children are there in each batch?",
    a: "Each batch has a maximum of five children, ensuring a structured learning environment and individual attention.",
  },
  {
    q: "What does my child learn during the program?",
    a: "Children participate in activities across our 9 Learning Domains, including English, Mathematics, Physical Development, Sensory Development, Perception & Cognitive Skills, General Awareness, Art & Craft, Play & Social Skills, and Music & Mantra Chanting.",
  },
  {
    q: "Will my child receive individual attention?",
    a: "Yes. Although children learn in a small group, activities are planned according to each child's learning needs and abilities.",
  },
  {
    q: "Do you provide one-to-one sessions?",
    a: "One-to-one sessions may be available on a case-by-case basis, depending on the child's needs and the availability of a special educator.",
  },
  {
    q: "Do you provide Speech Therapy, Occupational Therapy (OT), or ABA Therapy?",
    a: "No. Turtle Wings is a special education centre focused on structured learning and developmental support. We do not currently provide Speech Therapy, Occupational Therapy, or ABA Therapy.",
  },
  {
    q: "Do you have morning batches?",
    a: "Currently, we offer only the Evening Group Program. Additional batches may be introduced in the future based on demand.",
  },
  {
    q: "Is transportation available?",
    a: "We are currently exploring transportation options with a trusted service provider and will update parents as soon as the service becomes available.",
  },
  {
    q: "What is the admission process?",
    a: "The admission process begins with a complimentary Parent Consultation, followed by a 45-minute Admission Assessment to determine whether the Evening Group Program is the right fit for your child.",
  },
  {
    q: "Is there an Admission Assessment?",
    a: "Yes. The Parent Consultation is complimentary, while the child's 45-minute Admission Assessment is a chargeable session conducted by an RCI Certified Special Educator.",
  },
  {
    q: "What happens during the Admission Assessment?",
    a: "During the assessment, we observe your child's attention, sitting tolerance, ability to follow instructions, communication, behaviour, learning readiness, and ability to participate comfortably in a small group.",
  },
  {
    q: "What if my child is not ready for the group program?",
    a: "If we feel your child would benefit from additional preparation before joining a group, we will discuss our observations and guide you on the most appropriate next steps.",
  },
  {
    q: "Do parents stay during the session?",
    a: "Parents generally wait outside during the session to encourage independence, confidence, and meaningful participation in the group.",
  },
  {
    q: "What should my child wear?",
    a: "Please dress your child in comfortable clothing and suitable footwear that allows free movement during physical activities, sensory play, and classroom learning.",
  },
  {
    q: "Do you accept children from all schools?",
    a: "Yes. We welcome children from preschools, mainstream schools, and special schools, provided they are between 3 and 10 years of age and are suitable for our Evening Group Program.",
  },
];

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/program", label: "Program" },
  { to: "/members", label: "Members" },
  { to: "/faq", label: "FAQs" },
  { to: "/blog", label: "Blog" },
  { to: "/videos", label: "Videos" },
  { to: "/contact", label: "Contact" },
] as const;


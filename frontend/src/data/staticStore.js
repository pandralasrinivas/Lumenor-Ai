const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const productShape = (kind, accent, ink) => {
  switch (kind) {
    case "dress":
      return `
        <path d="M406 252h88l28 128 110 372c-98 44-266 44-364 0l110-372 28-128Z" fill="${accent}" opacity=".95"/>
        <path d="M402 252c18 50 78 62 96 0l-15-62h-66l-15 62Z" fill="${ink}" opacity=".92"/>
        <path d="M380 378h140" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".48"/>
      `;
    case "shoe":
      return `
        <path d="M190 650c70-40 142-80 210-162 54 96 142 146 276 160 54 6 88 42 90 92H224c-62 0-92-52-34-90Z" fill="${accent}"/>
        <path d="M220 742h546" stroke="${ink}" stroke-width="34" stroke-linecap="round"/>
        <path d="M402 512c42 42 86 70 134 86" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".7"/>
        <circle cx="575" cy="625" r="14" fill="#fff" opacity=".75"/>
      `;
    case "bag":
      return `
        <rect x="258" y="382" width="384" height="386" rx="64" fill="${accent}"/>
        <path d="M344 396c0-108 212-108 212 0" fill="none" stroke="${ink}" stroke-width="34" stroke-linecap="round"/>
        <path d="M310 492h280" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".55"/>
        <circle cx="370" cy="472" r="18" fill="${ink}" opacity=".78"/>
        <circle cx="530" cy="472" r="18" fill="${ink}" opacity=".78"/>
      `;
    case "watch":
      return `
        <rect x="396" y="172" width="108" height="756" rx="54" fill="${ink}" opacity=".88"/>
        <circle cx="450" cy="550" r="184" fill="${accent}"/>
        <circle cx="450" cy="550" r="132" fill="#fff" opacity=".92"/>
        <path d="M450 470v88l68 48" stroke="${ink}" stroke-width="18" stroke-linecap="round" fill="none"/>
      `;
    case "scarf":
      return `
        <path d="M248 286c126-64 272-64 404 0v408c-126 64-272 64-404 0V286Z" fill="${accent}"/>
        <path d="M302 352c86-36 204-36 296 0M302 446c86-36 204-36 296 0M302 540c86-36 204-36 296 0" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".62"/>
        <path d="M248 286l404 408M652 286 248 694" stroke="${ink}" stroke-width="20" opacity=".32"/>
      `;
    case "jacket":
    default:
      return `
        <path d="M292 296 400 232l50 134 50-134 108 64 78 446-118 34-48-270-18 352H398l-18-352-48 270-118-34 78-446Z" fill="${accent}"/>
        <path d="M400 232 450 366l50-134 40 332" fill="none" stroke="${ink}" stroke-width="24" stroke-linecap="round" opacity=".75"/>
        <path d="M328 430h90M482 430h90" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".55"/>
      `;
  }
};

const makeProductImage = ({ title, category, background, accent, ink, kind }) => {
  const safeTitle = escapeXml(title);
  const safeCategory = escapeXml(category);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
      <rect width="900" height="1100" rx="0" fill="${background}"/>
      <circle cx="720" cy="170" r="190" fill="#ffffff" opacity=".34"/>
      <circle cx="174" cy="916" r="260" fill="${accent}" opacity=".18"/>
      <ellipse cx="450" cy="855" rx="276" ry="58" fill="#1b1715" opacity=".13"/>
      ${productShape(kind, accent, ink)}
      <rect x="72" y="74" width="228" height="62" rx="31" fill="#ffffff" opacity=".7"/>
      <text x="186" y="114" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4" fill="${ink}">${safeCategory}</text>
      <text x="450" y="1004" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="${ink}">${safeTitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const review = (productId, index, rating, title, comment, firstName, lastName) => ({
  _id: `${productId}-review-${index}`,
  rating,
  title,
  comment,
  user: { firstName, lastName },
  createdAt: `2026-0${Math.min(index + 2, 7)}-1${index}T10:30:00.000Z`,
});

export const demoCustomer = {
  _id: "user-demo-customer",
  firstName: "Aarav",
  lastName: "Mehta",
  email: "customer@styleup.in",
  phone: "+91 98765 43210",
  role: "customer",
  createdAt: "2026-01-08T09:00:00.000Z",
};

export const demoAdmin = {
  _id: "user-demo-admin",
  firstName: "Store",
  lastName: "Admin",
  email: "admin@styleup.in",
  phone: "+91 90000 11122",
  role: "admin",
  createdAt: "2026-01-01T09:00:00.000Z",
};

export const demoAddresses = [
  {
    _id: "address-demo-home",
    fullName: "Aarav Mehta",
    phone: "+91 98765 43210",
    street: "42 Jubilee Hills Road",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500033",
    country: "India",
    isDefault: true,
  },
];

export const staticProducts = [
  {
    _id: "prod-tailored-overshirt",
    name: "Tailored Cotton Overshirt",
    description:
      "A structured cotton overshirt with a clean collar, weighty hand feel, and easy layering proportions for workdays and weekends.",
    category: "Men",
    price: 2499,
    discountPrice: 1899,
    rating: 4.8,
    images: [
      makeProductImage({
        title: "Cotton Overshirt",
        category: "Men",
        background: "#f4e7da",
        accent: "#9f6f56",
        ink: "#241a16",
        kind: "jacket",
      }),
    ],
    variants: [
      {
        color: "Camel",
        sizes: [
          { size: "S", stock: 8 },
          { size: "M", stock: 14 },
          { size: "L", stock: 9 },
          { size: "XL", stock: 4 },
        ],
      },
      {
        color: "Black",
        sizes: [
          { size: "M", stock: 7 },
          { size: "L", stock: 6 },
          { size: "XL", stock: 3 },
        ],
      },
    ],
    reviews: [
      review("prod-tailored-overshirt", 1, 5, "Great structure", "Feels polished without being stiff.", "Maya", "Lee"),
      review("prod-tailored-overshirt", 2, 5, "Sharp fit", "The camel color works with everything.", "Noah", "Patel"),
    ],
    createdAt: "2026-06-18T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-relaxed-oxford",
    name: "Relaxed Oxford Shirt",
    description:
      "A breathable button-down with a soft washed finish, curved hem, and a relaxed profile that tucks cleanly or wears open.",
    category: "Men",
    price: 1599,
    rating: 4.5,
    images: [
      makeProductImage({
        title: "Oxford Shirt",
        category: "Men",
        background: "#e6edf2",
        accent: "#7c9bb2",
        ink: "#152431",
        kind: "jacket",
      }),
    ],
    variants: [
      {
        color: "Blue",
        sizes: [
          { size: "S", stock: 12 },
          { size: "M", stock: 16 },
          { size: "L", stock: 10 },
        ],
      },
      {
        color: "White",
        sizes: [
          { size: "M", stock: 8 },
          { size: "L", stock: 8 },
        ],
      },
    ],
    reviews: [
      review("prod-relaxed-oxford", 1, 4, "Easy staple", "Soft from the first wear.", "Eli", "Brown"),
    ],
    createdAt: "2026-05-28T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-weekend-utility-jacket",
    name: "Weekend Utility Jacket",
    description:
      "A lightweight utility layer with practical pockets, matte hardware, and enough structure to finish a simple outfit.",
    category: "Men",
    price: 3299,
    discountPrice: 2699,
    rating: 4.7,
    images: [
      makeProductImage({
        title: "Utility Jacket",
        category: "Men",
        background: "#e8eadf",
        accent: "#5f7358",
        ink: "#20271e",
        kind: "jacket",
      }),
    ],
    variants: [
      {
        color: "Olive",
        sizes: [
          { size: "S", stock: 5 },
          { size: "M", stock: 11 },
          { size: "L", stock: 6 },
          { size: "XL", stock: 2 },
        ],
      },
    ],
    reviews: [
      review("prod-weekend-utility-jacket", 1, 5, "Perfect midweight", "Exactly right for travel days.", "Iris", "Chen"),
    ],
    createdAt: "2026-04-22T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-satin-slip-dress",
    name: "Satin Bias Slip Dress",
    description:
      "A fluid bias-cut slip dress with a soft sheen, adjustable straps, and a clean drape for dinners, events, and layered styling.",
    category: "Women",
    price: 2999,
    discountPrice: 2399,
    rating: 4.9,
    images: [
      makeProductImage({
        title: "Slip Dress",
        category: "Women",
        background: "#f4e3e4",
        accent: "#c46b77",
        ink: "#301418",
        kind: "dress",
      }),
    ],
    variants: [
      {
        color: "Rose",
        sizes: [
          { size: "XS", stock: 5 },
          { size: "S", stock: 8 },
          { size: "M", stock: 10 },
          { size: "L", stock: 4 },
        ],
      },
      {
        color: "Black",
        sizes: [
          { size: "S", stock: 7 },
          { size: "M", stock: 5 },
          { size: "L", stock: 2 },
        ],
      },
    ],
    reviews: [
      review("prod-satin-slip-dress", 1, 5, "Beautiful movement", "The drape is lovely and the fabric photographs well.", "Sofia", "Garcia"),
      review("prod-satin-slip-dress", 2, 5, "Dinner ready", "Simple, elegant, and easy to dress up.", "Harper", "Jones"),
    ],
    createdAt: "2026-07-02T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-linen-coord",
    name: "Linen Co-ord Set",
    description:
      "A relaxed linen blend set with a cropped camp shirt and pull-on trouser, designed for warm weather polish.",
    category: "Women",
    price: 3499,
    rating: 4.6,
    images: [
      makeProductImage({
        title: "Linen Co-ord",
        category: "Women",
        background: "#efece0",
        accent: "#b4a06e",
        ink: "#2f281a",
        kind: "dress",
      }),
    ],
    variants: [
      {
        color: "Sand",
        sizes: [
          { size: "XS", stock: 6 },
          { size: "S", stock: 9 },
          { size: "M", stock: 12 },
          { size: "L", stock: 6 },
        ],
      },
    ],
    reviews: [
      review("prod-linen-coord", 1, 5, "Vacation uniform", "Looks pulled together with almost no effort.", "Lena", "Stone"),
    ],
    createdAt: "2026-06-07T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-cropped-cardigan",
    name: "Cropped Rib Cardigan",
    description:
      "A ribbed cardigan with a cropped shape, subtle stretch, and pearled buttons for transitional layering.",
    category: "Women",
    price: 1799,
    discountPrice: 1399,
    rating: 4.4,
    images: [
      makeProductImage({
        title: "Rib Cardigan",
        category: "Women",
        background: "#eee4f0",
        accent: "#806196",
        ink: "#21172b",
        kind: "jacket",
      }),
    ],
    variants: [
      {
        color: "Plum",
        sizes: [
          { size: "XS", stock: 7 },
          { size: "S", stock: 9 },
          { size: "M", stock: 4 },
        ],
      },
      {
        color: "Cream",
        sizes: [
          { size: "S", stock: 6 },
          { size: "M", stock: 6 },
          { size: "L", stock: 3 },
        ],
      },
    ],
    reviews: [
      review("prod-cropped-cardigan", 1, 4, "Soft knit", "A nice shape with high-waist denim.", "Ari", "Kim"),
    ],
    createdAt: "2026-03-16T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-city-leather-sneaker",
    name: "City Leather Sneaker",
    description:
      "A clean everyday sneaker with a cushioned footbed, leather upper, and understated contrast paneling.",
    category: "Footwear",
    price: 2799,
    discountPrice: 2199,
    rating: 4.8,
    images: [
      makeProductImage({
        title: "Leather Sneaker",
        category: "Footwear",
        background: "#e7edf0",
        accent: "#f5f1e8",
        ink: "#22303a",
        kind: "shoe",
      }),
    ],
    variants: [
      {
        color: "White",
        sizes: [
          { size: "7", stock: 8 },
          { size: "8", stock: 12 },
          { size: "9", stock: 9 },
          { size: "10", stock: 5 },
        ],
      },
      {
        color: "Navy",
        sizes: [
          { size: "8", stock: 6 },
          { size: "9", stock: 6 },
          { size: "10", stock: 3 },
        ],
      },
    ],
    reviews: [
      review("prod-city-leather-sneaker", 1, 5, "All-day comfortable", "Polished enough for the office commute.", "Theo", "Nguyen"),
      review("prod-city-leather-sneaker", 2, 5, "Looks premium", "Great shape and easy to keep clean.", "Mila", "Reed"),
    ],
    createdAt: "2026-06-25T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-ankle-boot",
    name: "Sculpted Ankle Boot",
    description:
      "A softly squared ankle boot with a walkable heel and tonal stitching that anchors tailoring and denim alike.",
    category: "Footwear",
    price: 3999,
    rating: 4.7,
    images: [
      makeProductImage({
        title: "Ankle Boot",
        category: "Footwear",
        background: "#f0e7df",
        accent: "#7b4d37",
        ink: "#241710",
        kind: "shoe",
      }),
    ],
    variants: [
      {
        color: "Chestnut",
        sizes: [
          { size: "6", stock: 5 },
          { size: "7", stock: 9 },
          { size: "8", stock: 7 },
          { size: "9", stock: 4 },
        ],
      },
    ],
    reviews: [
      review("prod-ankle-boot", 1, 5, "Very wearable heel", "Comfortable enough for a long day out.", "Nora", "Hall"),
    ],
    createdAt: "2026-02-24T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-cloud-runner",
    name: "Cloud Runner Trainer",
    description:
      "A lightweight trainer with a sculpted sole, breathable knit upper, and enough color to wake up an off-duty look.",
    category: "Footwear",
    price: 2499,
    discountPrice: 1899,
    rating: 4.3,
    images: [
      makeProductImage({
        title: "Runner Trainer",
        category: "Footwear",
        background: "#e8f0ea",
        accent: "#65a88a",
        ink: "#173127",
        kind: "shoe",
      }),
    ],
    variants: [
      {
        color: "Sage",
        sizes: [
          { size: "7", stock: 7 },
          { size: "8", stock: 9 },
          { size: "9", stock: 5 },
          { size: "10", stock: 2 },
        ],
      },
    ],
    reviews: [
      review("prod-cloud-runner", 1, 4, "Light and fun", "Good cushion and a great color.", "Kai", "Smith"),
    ],
    createdAt: "2026-05-11T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-mini-tote",
    name: "Structured Mini Tote",
    description:
      "A compact top-handle tote with a removable strap, smooth finish, and enough room for daily essentials.",
    category: "Accessories",
    price: 2999,
    discountPrice: 2299,
    rating: 4.9,
    images: [
      makeProductImage({
        title: "Mini Tote",
        category: "Accessories",
        background: "#f0e6df",
        accent: "#9b5d48",
        ink: "#2b1812",
        kind: "bag",
      }),
    ],
    variants: [
      {
        color: "Cognac",
        sizes: [{ size: "One Size", stock: 11 }],
      },
      {
        color: "Black",
        sizes: [{ size: "One Size", stock: 6 }],
      },
    ],
    reviews: [
      review("prod-mini-tote", 1, 5, "Small but useful", "The shape makes every outfit feel finished.", "June", "Parker"),
    ],
    createdAt: "2026-07-09T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-silk-scarf",
    name: "Printed Silk Square Scarf",
    description:
      "A lightweight silk scarf with graphic border artwork for tying at the neck, wrist, bag handle, or hair.",
    category: "Accessories",
    price: 999,
    rating: 4.5,
    images: [
      makeProductImage({
        title: "Silk Scarf",
        category: "Accessories",
        background: "#f4ece6",
        accent: "#d9896a",
        ink: "#3b1f17",
        kind: "scarf",
      }),
    ],
    variants: [
      {
        color: "Coral",
        sizes: [{ size: "One Size", stock: 18 }],
      },
      {
        color: "Blue",
        sizes: [{ size: "One Size", stock: 9 }],
      },
    ],
    reviews: [
      review("prod-silk-scarf", 1, 4, "Pretty accent", "Nice color and easy to style on a tote.", "Riley", "Fox"),
    ],
    createdAt: "2026-04-04T10:30:00.000Z",
    isActive: true,
  },
  {
    _id: "prod-minimalist-watch",
    name: "Minimalist Round Watch",
    description:
      "A slim round watch with clean hour markers, a polished case, and an interchangeable leather strap.",
    category: "Accessories",
    price: 2499,
    rating: 4.6,
    images: [
      makeProductImage({
        title: "Round Watch",
        category: "Accessories",
        background: "#e6edf0",
        accent: "#d4b15f",
        ink: "#202528",
        kind: "watch",
      }),
    ],
    variants: [
      {
        color: "Tan",
        sizes: [{ size: "One Size", stock: 8 }],
      },
      {
        color: "Black",
        sizes: [{ size: "One Size", stock: 5 }],
      },
    ],
    reviews: [
      review("prod-minimalist-watch", 1, 5, "Clean design", "Simple face and comfortable strap.", "Sam", "Walker"),
    ],
    createdAt: "2026-01-19T10:30:00.000Z",
    isActive: true,
  },
];

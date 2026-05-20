# Fashion Store - MERN E-commerce Application

A full-stack MERN (MongoDB, Express, React, Node.js) fashion e-commerce storefront with personalized recommendations, dynamic product variants, and customer order flows.

## 🌟 Features

### Authentication & Security

- User registration and login with JWT authentication
- Password encryption using bcrypt
- Profile management

### Product Management

- Fashion product catalog with categories (Men, Women, Footwear, Accessories)
- Dynamic product variants (sizes, colors, stock availability)
- Product search and filtering

### Personalized Recommendations

- Recommendations based on recently viewed products
- Purchase history-based recommendations
- Trending products
- Dynamic category-based suggestions

### Shopping Experience

- Add to cart functionality
- Cart management (update quantities, remove items)
- Coupon code application
- Real-time cart updates

### Checkout & Orders

- Multi-step checkout process
- Address management (multiple delivery addresses)
- Order confirmation via email
- Order history with invoice generation (PDF)
- Order status tracking

### Additional Features

- Product reviews and ratings
- Email notifications (registration and order confirmation)
- Responsive mobile-first UI
- Modern Tailwind CSS design

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Email**: Nodemailer
- **PDF Generation**: PDFKit
- **File Upload**: Multer
- **Validation**: express-validator

### Frontend

- **Framework**: React 18+
- **Routing**: React Router DOM v6
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation
- Git

## 🚀 Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd fashion-store
```

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create .env file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` and add:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fashion_store
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM=noreply@fashionstore.com
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the backend server**

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create .env.local file**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   Edit `.env.local`:

   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENV=development
   ```

5. **Start the development server**

   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## 📁 Project Structure

```
fashion-store/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   ├── config/          # Database, email config
│   │   ├── utils/           # JWT, password utilities
│   │   └── server.js        # Express app setup
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── redux/           # Redux slices & store
│   │   ├── utils/           # API calls, helpers
│   │   ├── styles/          # CSS & Tailwind config
│   │   ├── App.jsx          # Main app component
│   │   └── index.js         # Entry point
│   ├── public/              # Static files
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Products

- `GET /api/products` - Get all products (with filtering & pagination)
- `GET /api/products/:id` - Get product details

### Cart

- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/update` - Update cart item quantity (protected)
- `DELETE /api/cart/remove/:itemId` - Remove item from cart (protected)
- `POST /api/cart/coupon` - Apply coupon code (protected)
- `DELETE /api/cart/clear` - Clear entire cart (protected)

### Orders

- `POST /api/orders` - Create new order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `GET /api/orders/:id/invoice` - Download order invoice (protected)

### Addresses

- `GET /api/addresses` - Get user's addresses (protected)
- `POST /api/addresses` - Add new address (protected)
- `PUT /api/addresses/:id` - Update address (protected)
- `DELETE /api/addresses/:id` - Delete address (protected)

### Recommendations

- `GET /api/recommendations/recently-viewed` - Get recommendations based on recently viewed (protected)
- `GET /api/recommendations/purchase-history` - Get recommendations from purchase history (protected)
- `GET /api/recommendations/personalized` - Get personalized recommendations (protected)
- `POST /api/recommendations/add-viewed` - Add product to recently viewed (protected)

### Reviews

- `POST /api/reviews` - Create product review (protected)
- `GET /api/reviews/product/:productId` - Get product reviews
- `DELETE /api/reviews/:id` - Delete review (protected)

## 🧪 Testing the Application

### Create a Test User

1. Click "Register" on the homepage
2. Fill in the registration form with test data
3. You'll receive a welcome email (check spam folder)

### Test Shopping Flow

1. Login with your test account
2. Browse products on homepage
3. Click on a product to view details
4. Add items to cart with selected size/color
5. View cart and proceed to checkout
6. Add delivery address
7. Place order
8. Check email for order confirmation
9. View order in "My Orders" section
10. Download invoice as PDF

### Test Recommendations

1. View multiple products in different categories
2. Go to product details to see recommendations
3. Complete a purchase
4. Check if recommendations update based on purchase history

### Apply Coupon Code

1. Create a coupon in MongoDB: `db.coupons.insertOne({ code: "TEST10", discountType: "percentage", discountValue: 10, isActive: true, expiryDate: new Date("2025-12-31") })`
2. Add items to cart
3. Enter coupon code "TEST10"
4. Discount should be applied

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the app password in `.env` as `SMTP_PASS`

### Test Email Sending

Emails are sent for:

- User registration (welcome email)
- Order confirmation

Check spam folder if emails don't appear

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. **Prepare backend for production**

   ```bash
   npm install
   ```

2. **Create Procfile** (for Render/Heroku)

   ```
   web: node src/server.js
   ```

3. **Push to GitHub**

4. **Deploy on Render**
   - Connect GitHub repository
   - Set environment variables
   - Deploy

### Frontend Deployment (Vercel/Netlify)

1. **Build frontend**

   ```bash
   npm run build
   ```

2. **Deploy with Vercel**

   ```bash
   npm install -g vercel
   vercel
   ```

3. **Or deploy with Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

### MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Add IP whitelist
4. Create database user
5. Copy connection string to `.env`

## 🔐 Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets
- Validate all inputs on both frontend and backend
- Use HTTPS in production
- Keep dependencies updated
- Use environment-specific configurations
- Implement rate limiting in production

## 📱 Responsive Design

The application is fully responsive and mobile-optimized:

- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🚀 Performance Optimization

- Image lazy loading
- Code splitting with React Router
- Redux for efficient state management
- MongoDB indexing for faster queries
- API response caching strategies

## 🐛 Troubleshooting

### MongoDB Connection Error

- Verify connection string in `.env`
- Check IP whitelist on MongoDB Atlas
- Ensure MongoDB credentials are correct

### Email Not Sending

- Check SMTP credentials
- Enable "Less secure app access" for Gmail (if not using app password)
- Check spam folder
- Verify `EMAIL_FROM` matches SMTP_USER

### CORS Errors

- Ensure frontend URL is in backend CORS configuration
- Check that API calls use correct base URL

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000    # Windows
```

## 📄 API Documentation

Full API documentation is available in the `API_DOCS.md` file with examples for each endpoint.

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💼 Author

Built as a comprehensive MERN stack e-commerce solution.

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Check MongoDB logs
4. Review browser console for frontend errors

## 🔄 Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Wishlist functionality
- Social media login
- Real-time notifications
- Customer support chat
- Inventory sync with suppliers
- Advanced search filters
- AR try-on features

---

**Happy Shopping!** 🛍️

# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with email or Google account
3. Create a new project

### Step 2: Create a Cluster
1. Click "Create" to build a new cluster
2. Choose **Shared** (Free tier)
3. Select your region (closest to you)
4. Click "Create Cluster"

### Step 3: Add IP Address to Whitelist
1. Go to **Network Access**
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server IP address

### Step 4: Create Database User
1. Go to **Database Access**
2. Click "Add New Database User"
3. Enter username (e.g., `fashion_admin`)
4. Enter a strong password
5. Click "Create Database User"
6. **Note the username and password - you'll need them**

### Step 5: Get Connection String
1. Go to your Cluster
2. Click "Connect" button
3. Choose "Connect your application"
4. Copy the connection string
5. It should look like: `mongodb+srv://username:password@cluster.mongodb.net/fashion_store?retryWrites=true&w=majority`

### Step 6: Update .env File
Replace the MONGODB_URI in `.env`:
```
MONGODB_URI=mongodb+srv://fashion_admin:your_password@cluster.mongodb.net/fashion_store?retryWrites=true&w=majority
```

---

## Option 2: Local MongoDB (Development Only)

### Step 1: Install MongoDB
**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Run installer (.msi file)
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. Complete the installation

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Verify Installation
```bash
# Open MongoDB shell
mongosh

# Should show: "test> "
```

### Step 3: Update .env File
```
MONGODB_URI=mongodb://localhost:27017/fashion_store
```

### Step 4: Create Database and User (Optional but recommended)
```bash
# In MongoDB shell (mongosh)
use fashion_store
db.createUser({
  user: "fashion_admin",
  pwd: "your_password",
  roles: ["readWrite"]
})
```

---

## Testing Your Connection

### Step 1: Update .env with Your Credentials
Edit `backend/.env` and replace:
- MongoDB URI with your actual connection string

### Step 2: Start the Backend
```bash
cd backend
npm run dev
```

### Step 3: Check for Connection Success
You should see:
```
MongoDB Connected: cluster.mongodb.net
Server running on port 5000
```

### If Connection Fails:

**Error: "Authentication failed"**
- Check username and password in connection string
- Verify database user exists in MongoDB Atlas
- Ensure IP is whitelisted (if using Atlas)

**Error: "connect ECONNREFUSED"**
- Local MongoDB not running
- Check if MongoDB service is started

**Error: "MongoNetworkError"**
- IP not whitelisted (if using Atlas)
- Network connection issue
- Invalid connection string format

---

## Recommended Credentials for Development

Update your `.env` file with these secure values:

```
# MongoDB
MONGODB_URI=mongodb+srv://fashion_admin:SecurePass123!@cluster.mongodb.net/fashion_store?retryWrites=true&w=majority

# JWT (Generate a random string)
JWT_SECRET=aB1!cD2@eF3#gH4$iJ5%kL6^mN7&oP8*qR9(sT0)uV1-wX2=yZ3+aA4bB5cC6dD7

# Email (Use Gmail with App Password)
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

---

## Next Steps

1. Choose MongoDB option (Atlas recommended)
2. Set up credentials
3. Update `.env` file
4. Run: `npm run dev` in backend folder
5. Verify connection logs

---

**Quick Reference:**
- **MongoDB Atlas** - Best for production (cloud-hosted)
- **Local MongoDB** - Best for development (no internet required)
- **Mongoose** - Already installed in backend (handles connection)

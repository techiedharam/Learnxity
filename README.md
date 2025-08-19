# 📚 LearnXity – Fullstack LMS (Learning Management System)

LearnXity is a modern **Learning Management System (LMS)** built with **MERN Stack (MongoDB, Express, React/Next.js, Node.js)**.  
It provides a complete platform for **users** (students/learners) and **admins**, with secure authentication, course management, and role-based dashboards.

---

## 🚀 Features

### ✅ Phase 1: Core User System & Authentication
- User Signup/Login with **JWT + bcrypt**
- Admin Login with elevated privileges
- Email-based account activation (OTP)
- Secure session handling with access/refresh tokens
- **Profile Management**: upload avatar (Cloudinary), edit name, bio, social links
- Social login (Google OAuth)

### ✅ Phase 2: Course Management System
- Users can create & manage their own courses
- Course fields: title, description, category, price (free/paid)
- Upload thumbnail/image
- Draft or Publish status
- Admin approval workflow (Approve/Reject with feedback)

### ✅ Phase 3: Course Browsing & Enrollment
- Course listing with search & filters (category, price, creator)
- Course detail page with full info
- Enroll in free or paid courses
- Payment integration (Razorpay/Stripe)
- User payment history & enrollments

### ✅ Phase 4: Learning Experience
- **My Courses Dashboard** with progress tracking
- Course player UI:
  - Sidebar → lessons/modules
  - Main area → video, text, quizzes
- Auto-mark lessons as complete
- Track % course progress

### ✅ Phase 5: Quizzes, Certificates & Reviews
- Lesson quizzes (MCQs with auto-check)
- Certificates (auto-generated PDF on completion)
- Users can leave ratings & reviews
- Show average course rating

### ✅ Phase 6: Admin Tools
- Manage all users
- Manage all courses (approve/reject)
- Manage categories
- Platform analytics dashboard

### ✅ Phase 7: Additional Features
- Notifications (Email + In-App)
  - Enrollment success
  - Course approval/rejection
  - Quiz results
- Blog/Articles system (optional)
- Community discussion forum (optional)

### ✅ Phase 8: Marketing & SEO
- SEO-friendly **Landing Page**
  - Hero section, Popular courses, Testimonials
- SEO optimization (meta tags, sitemap, robots.txt)
- Slug-based friendly URLs
- Newsletter signup (Mailchimp or custom)

---

## 🧭 Suggested Development Flow
1. Set up **monorepo** (Next.js + Express + MongoDB + Redux)  
2. Build authentication & role-based routing (User & Admin)  
3. Implement course creation & browsing  
4. Add course player with progress tracking  
5. Integrate payments & enrollment  
6. Complete dashboards (User + Admin)  
7. Add certificates, ratings & reviews  
8. Optimize UX/UI & add optional features  
9. Finalize SEO, analytics & deployment  

---

## ⚙️ Tech Stack
- **Frontend**: Next.js (React, Redux, TailwindCSS)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Redis (for caching/sessions)
- **Authentication**: JWT + bcrypt + Google OAuth
- **File Storage**: Cloudinary
- **Payments**: Razorpay / Stripe
- **Emailing**: Nodemailer + EJS templates

---

## 📌 Setup Instructions
1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/learnxity.git
   cd learnxity

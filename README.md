# Ortega Freelance

A React + Vite web application for freelance services.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)
- Google reCAPTCHA v2 Site Key (get from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin))

## Installation

1. Clone the repository
2. Install all dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `VITE_RECAPTCHA_SITE_KEY` with your Google reCAPTCHA v2 site key.
   - **Important:** You must use a **reCAPTCHA v2 "I'm not a robot" Checkbox** key (NOT v3)

## Running the Project

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Additional Commands

- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Setting up Google reCAPTCHA

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" or "+" to register a new site
3. Choose **reCAPTCHA v2** and select **"I'm not a robot" Checkbox**
4. Add your domain(s) (for development, add `localhost`)
5. Copy the **Site Key** and paste it into your `.env` file as `VITE_RECAPTCHA_SITE_KEY`

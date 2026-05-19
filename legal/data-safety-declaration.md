# Google Play Data Safety Declaration — Mulema

Use this information to complete the **Data Safety** section in the Google Play Console.

## 1. Data Collection and Security
- **Does your app collect or share any of the required user data types?** Yes
- **Is all of the user data collected by your app encrypted in transit?** Yes (All API calls use HTTPS)
- **Do you provide a way for users to request that their data be deleted?** Yes (Account deletion request via settings/email)

## 2. Data Types Collected

### Personal Information
- **Name:** Collected for account profile. (Purpose: Account management, App functionality)
- **Email address:** Collected for authentication. (Purpose: Account management, App functionality)
- **User IDs:** Internal IDs for progress tracking. (Purpose: App functionality)

### App Activity
- **App interactions:** Tracking lessons completed, XP earned. (Purpose: App functionality, Analytics)

### App Info and Performance
- **Crash logs:** (If using Sentry/Crashlytics) (Purpose: Analytics)
- **Diagnostics:** Performance data. (Purpose: Analytics)

### Device or Other IDs
- **Device or other IDs:** Internal IDs. (Purpose: App functionality)

## 3. Data Usage and Sharing
- **Data Sharing:** We do **NOT** share any user data with third parties for marketing or advertising.
- **Service Providers:** Data is processed by our secure backend hosting (e.g., Railway/PostgreSQL).

## 4. Privacy Policy URL
Ensure you have the live URL pointing to your hosted privacy policy:
`https://api.mulema.app/legal/privacy.html` (or your custom domain)

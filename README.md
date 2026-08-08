# Trackify — Performance Evaluation Tool

Trackify is a multi-tenant employee performance evaluation application where managers provide monthly feedback to their team members across five fixed performance parameters.

The application supports multiple companies using the same platform while keeping their data isolated.

## Live Application

https://trackify-lm68.vercel.app/

## GitHub Repository

https://github.com/Lokesh-0805/Trackify

---

## Features

### Employee App

- Secure JWT-based login
- View personal profile
- View direct reports/team members
- View pending feedback assignments
- Give monthly feedback to assigned employees
- Rate employees across five fixed parameters
- Provide written comments for every parameter
- View historical performance scores
- Track scores parameter-wise across different months

### HR App

- HR-specific dashboard
- View feedback completion status
- See submitted and pending feedback
- Identify which reviewer has not completed feedback
- View feedback status for the company's current cycle

### Multi-Tenant Architecture

Multiple companies use the same application.

Company-specific data is isolated using `companyId`.

For example:

```text
Ashoka Textiles
        │
        └── Employees & Feedback

Bright Path Consulting
        │
        └── Employees & Feedback
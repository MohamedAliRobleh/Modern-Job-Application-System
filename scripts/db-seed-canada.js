// scripts/db-seed-canada.js
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const JOBS = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote — Canada',
    type: 'Full-time',
    description: `Join our product team to design and build fast, accessible, and beautiful interfaces used by hundreds of thousands of Canadians. You will work closely with designers, backend engineers, and product managers to shape the frontend architecture of our flagship platform.

Responsibilities:
• Design and implement complex features in React and TypeScript
• Champion performance, accessibility (WCAG 2.1 AA), and code quality across the codebase
• Lead code reviews and mentor junior developers
• Contribute to our design system and its documentation
• Monitor and improve Core Web Vitals and key performance metrics

We are a remote-first team distributed across Canada. Every voice is heard and every idea is considered.`,
    requirements: `• 5+ years of frontend development experience
• Advanced proficiency in React, TypeScript, and modern CSS
• Strong experience with testing tools (Vitest, Cypress, Testing Library)
• Deep understanding of web performance and server-side rendering
• Ability to collaborate effectively in a remote-first environment
• Nice to have: experience with Next.js, Vite, or modern bundlers`,
    salary_range: '$110,000 – $145,000 CAD',
  },
  {
    title: 'Senior Backend Engineer — Node.js & PostgreSQL',
    department: 'Engineering',
    location: 'Toronto, ON',
    type: 'Full-time',
    description: `Our backend team is looking for a passionate engineer to build the APIs and data pipelines that power our high-availability platform. You will work on distributed systems processing millions of requests per day.

Responsibilities:
• Design and build high-performance RESTful and GraphQL APIs
• Optimize PostgreSQL queries and architect database schemas
• Build real-time data processing pipelines
• Ensure service reliability (99.9% SLA) through SRE practices
• Integrate third-party services (Stripe, Twilio, etc.) securely
• Participate in on-call rotations (equitable, compensated schedule)

Our Toronto office is located in the heart of the Financial District, steps from King Station. Hybrid remote available 3 days per week.`,
    requirements: `• 4+ years of backend experience (Node.js, Go, or Python)
• Strong command of PostgreSQL — indexing, transactions, query optimization
• Experience with microservices and distributed system architectures
• Solid knowledge of security best practices (OAuth 2.0, JWT, OWASP)
• Familiarity with AWS or GCP (Lambda, RDS, Cloud Run)
• Nice to have: experience with Kafka, Redis, or Temporal`,
    salary_range: '$105,000 – $140,000 CAD',
  },
  {
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'Montréal, QC',
    type: 'Full-time',
    description: `We are looking for an experienced product designer to shape the visual and interactive experience of our platform. You will be the bridge between user needs and technical reality, driving work from research all the way through to pixel-perfect delivery.

Responsibilities:
• Lead user research — interviews, usability testing, A/B experiments
• Create wireframes and high-fidelity prototypes in Figma for new features
• Maintain and evolve our design system (components, tokens, documentation)
• Collaborate with engineering and product from early discovery through launch
• Advocate for user needs in product decisions
• Present design decisions clearly to stakeholders at all levels

Our design team is small and high-impact — you will have direct influence over the entire product. Based in Montreal with hybrid remote available 2 days per week.`,
    requirements: `• 4+ years in product design (web or mobile applications)
• Advanced Figma proficiency (components, auto-layout, variables)
• Portfolio demonstrating a full process: research, wireframes, UI, delivery
• Experience with usability testing and qualitative research methods
• Strong understanding of frontend technical constraints
• Nice to have: design system experience or accessibility expertise (WCAG)`,
    salary_range: '$95,000 – $125,000 CAD',
  },
  {
    title: 'DevOps & Cloud Infrastructure Engineer',
    department: 'Engineering',
    location: 'Vancouver, BC',
    type: 'Full-time',
    description: `Join our infrastructure team to transform how we deploy, monitor, and scale our services. You will build robust CI/CD pipelines, automate our infrastructure, and ensure world-class reliability for our users across Canada.

Responsibilities:
• Design and manage our AWS infrastructure (EKS, RDS, CloudFront, S3)
• Write and maintain Terraform code following infrastructure-as-code principles
• Optimize our GitHub Actions pipelines (build, test, deploy)
• Build and improve our observability stack (Datadog, OpenTelemetry)
• Partner with development teams to improve the developer experience (DX)
• Lead capacity planning and chaos engineering exercises

Based in Vancouver with flexible remote options. Our infrastructure team is at the forefront of DevSecOps practices in Canada.`,
    requirements: `• 5+ years in DevOps, SRE, or infrastructure engineering
• Solid AWS experience (certifications are a plus)
• Proficiency with Kubernetes, Helm, and GitOps practices
• Strong knowledge of Terraform and IaC principles
• Experience with monitoring and alerting tools (Datadog, PagerDuty)
• Nice to have: AWS Solutions Architect or CKA (Kubernetes) certification`,
    salary_range: '$115,000 – $150,000 CAD',
  },
  {
    title: 'Data Scientist — AI & Analytics',
    department: 'Data & AI',
    location: 'Ottawa, ON',
    type: 'Full-time',
    description: `We are looking for a data scientist to transform our data into actionable insights and intelligent product features. You will work at the intersection of statistics, machine learning, and product development to solve real problems for our Canadian users.

Responsibilities:
• Design and train ML models for personalization and anomaly detection
• Analyze large datasets to identify growth and optimization opportunities
• Collaborate with engineering to deploy models into production
• Build dashboards and reports for business and executive teams
• Implement reliable and scalable ETL data pipelines
• Ensure data governance and compliance with Canadian privacy standards (PIPEDA)

Our data stack: Python, PySpark, dbt, Snowflake, Airflow. Based in Ottawa with regular engagement with our government and enterprise partners.`,
    requirements: `• 3+ years in applied data science or machine learning
• Proficiency in Python (pandas, scikit-learn, PyTorch or TensorFlow)
• Advanced SQL and analytical query optimization skills
• Knowledge of MLOps pipelines (MLflow, Weights & Biases)
• Understanding of data privacy requirements (PIPEDA/LPRPDE)
• Nice to have: experience with LLMs, RAG, or production-grade NLP`,
    salary_range: '$100,000 – $135,000 CAD',
  },
  {
    title: 'Product Manager — B2B Platform',
    department: 'Product',
    location: 'Calgary, AB',
    type: 'Full-time',
    description: `As PM on our B2B segment, you will own the vision, strategy, and roadmap for a suite of features used by small and medium businesses across Canada. You will work directly with customers, engineering, and leadership to prioritize the highest-impact problems.

Responsibilities:
• Define and prioritize the product roadmap in collaboration with leadership
• Run customer interviews and analyze feedback to surface real needs
• Write clear PRDs, user stories, and precise acceptance criteria
• Work in sprints with engineering and design (Agile / Shape Up)
• Track and own success metrics (activation, retention, NPS, revenue)
• Coordinate product launches with marketing and sales teams

You will thrive in a culture of fast decisions and real autonomy. Based in Calgary with hybrid remote (2 days/week) and occasional travel to Montreal, Toronto, and Vancouver for customer visits.`,
    requirements: `• 4+ years in product management (ideally B2B or SaaS)
• Ability to synthesize qualitative and quantitative data into clear decisions
• Excellent written and verbal communication skills in English (French is a plus)
• Hands-on with product tools: Jira, Linear, Productboard, Figma
• Strong prioritization instincts and ability to say no with empathy
• Nice to have: experience building products for Canadian SMBs`,
    salary_range: '$100,000 – $130,000 CAD',
  },
  {
    title: 'Marketing & Growth Manager',
    department: 'Marketing',
    location: 'Remote — Canada',
    type: 'Full-time',
    description: `Join our team to drive acquisition strategy and brand awareness across Canada. You will build and execute multichannel campaigns, manage our online presence, and develop strategic partnerships that fuel our growth.

Responsibilities:
• Develop and execute the full marketing strategy (content, SEO, paid, events)
• Own the marketing budget and optimize CAC/LTV ratios
• Create high-quality content for our blog, LinkedIn, and newsletters
• Partner with sales to align demand generation efforts
• Analyze campaign performance and iterate quickly on what works
• Represent the brand at Canadian industry events (2–3 conferences per year)

100% remote anywhere in Canada. Occasional travel for key events and team offsites.`,
    requirements: `• 4+ years in B2B marketing, ideally in SaaS or tech
• Proficiency in content marketing, SEO, and paid campaigns (Google Ads, LinkedIn)
• Experience with HubSpot, Salesforce, or similar CRM tools
• Strong writer in English (French is a strong asset)
• Data-driven: comfortable with Google Analytics, Looker, or equivalent
• Nice to have: existing network in the Canadian startup ecosystem`,
    salary_range: '$90,000 – $115,000 CAD',
  },
  {
    title: 'QA Engineer — Automation & Quality',
    department: 'Engineering',
    location: 'Edmonton, AB',
    type: 'Full-time',
    description: `Join our quality engineering team to ensure our platform meets the highest standards of reliability and user experience. You will design and implement automated test suites, catch regressions before they reach users, and champion quality across all product teams.

Responsibilities:
• Build and maintain end-to-end and integration test suites (Playwright, Cypress)
• Define and enforce testing standards across frontend and backend teams
• Implement performance and load testing to ensure scalability
• Collaborate with developers to shift quality left in the development process
• Triage and investigate production incidents and reported bugs
• Create clear documentation for QA processes and test plans

Based in Edmonton with hybrid remote available (3 days/week). You will work across all squads as a quality advocate.`,
    requirements: `• 3+ years in QA engineering or software testing
• Strong experience with test automation frameworks (Playwright, Cypress, or Selenium)
• Solid understanding of REST API testing (Postman, REST-assured)
• Experience with CI/CD integration for automated test pipelines
• Analytical mindset with strong attention to detail
• Nice to have: performance testing experience (k6, Locust, JMeter)`,
    salary_range: '$85,000 – $110,000 CAD',
  },
  {
    title: 'Mobile Developer — React Native',
    department: 'Engineering',
    location: 'Québec City, QC',
    type: 'Full-time',
    description: `Our mobile app, used by over 200,000 Canadians, needs you. You will own new features, performance improvements, and the user experience across iOS and Android.

Responsibilities:
• Develop and maintain our React Native application (iOS and Android)
• Collaborate with design to build smooth animations and fluid transitions
• Integrate backend APIs and manage client-side state (Redux Toolkit or Zustand)
• Ensure solid test coverage (Jest, Detox)
• Own releases on the App Store and Google Play
• Optimize app performance (startup time, memory usage, bundle size)

Based in Quebec City as part of a tight-knit, supportive team. Hybrid remote available 3 days per week.`,
    requirements: `• 3+ years of mobile development (React Native or native iOS/Android)
• Strong proficiency in JavaScript and TypeScript
• Experience with REST APIs and client-side state management
• Familiarity with the App Store and Google Play release process
• Attention to detail for micro-interactions and UI smoothness
• Nice to have: experience with Expo, Reanimated, or MMKV`,
    salary_range: '$95,000 – $125,000 CAD',
  },
]

async function seed() {
  console.log('Clearing existing job listings...')
  await sql`DELETE FROM job_listings`
  await sql`ALTER SEQUENCE job_listings_id_seq RESTART WITH 1`

  console.log(`Inserting ${JOBS.length} Canadian job listings...`)

  for (const job of JOBS) {
    await sql`
      INSERT INTO job_listings (title, department, location, type, description, requirements, salary_range, is_active)
      VALUES (${job.title}, ${job.department}, ${job.location}, ${job.type}, ${job.description}, ${job.requirements}, ${job.salary_range}, true)
    `
    console.log(`  ✓ ${job.title} — ${job.location}`)
  }

  const count = await sql`SELECT COUNT(*) AS n FROM job_listings`
  console.log(`\n✅ ${count[0].n} job listings inserted successfully.`)
}

seed().catch(err => { console.error(err); process.exit(1) })

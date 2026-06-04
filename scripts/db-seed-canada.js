// scripts/db-seed-canada.js
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const JOBS = [
  {
    title: 'Ingénieur(e) Frontend Senior',
    department: 'Ingénierie',
    location: 'Remote — Canada',
    type: 'Full-time',
    description: `Vous rejoindrez notre équipe produit pour concevoir et développer des interfaces rapides, accessibles et élégantes utilisées par des centaines de milliers de Canadiens. Vous travaillerez en étroite collaboration avec nos designers, ingénieurs backend et gestionnaires de produits pour façonner l'architecture frontend de notre plateforme principale.

Vos responsabilités :
• Concevoir et implémenter des fonctionnalités complexes en React et TypeScript
• Assurer la performance, l'accessibilité (WCAG 2.1 AA) et la qualité du code
• Participer aux revues de code et au mentorat des développeurs juniors
• Contribuer au design system et à sa documentation
• Optimiser les Core Web Vitals et les métriques de performance

Nous sommes une équipe remote-first distribuée à travers le Canada. Chaque voix est entendue et chaque idée est considérée.`,
    requirements: `• 5+ ans d'expérience en développement frontend
• Maîtrise avancée de React, TypeScript et CSS moderne
• Expérience avec les tests (Vitest, Cypress, Testing Library)
• Solide compréhension de la performance web et du rendu côté serveur
• Capacité à collaborer efficacement en contexte remote
• Atout : expérience avec Next.js, Vite ou des bundlers modernes`,
    salary_range: '110 000 $ – 145 000 $ CAD',
  },
  {
    title: 'Ingénieur(e) Backend — Node.js & PostgreSQL',
    department: 'Ingénierie',
    location: 'Toronto, ON',
    type: 'Full-time',
    description: `Notre équipe backend cherche un(e) ingénieur(e) passionné(e) pour construire les APIs et pipelines de données qui alimentent notre plateforme à haute disponibilité. Vous travaillerez sur des systèmes distribués traitant des millions de requêtes par jour.

Vos responsabilités :
• Concevoir et développer des APIs RESTful et GraphQL performantes
• Optimiser les requêtes PostgreSQL et architecturer les schémas de données
• Mettre en place des pipelines de traitement de données en temps réel
• Assurer la fiabilité des services (SLA 99,9 %) via des pratiques SRE
• Intégrer des services tiers (Stripe, Twilio, etc.) de façon sécurisée
• Participer aux astreintes (rotation équitable, indemnisée)

Bureau au coeur du quartier financier de Toronto, à deux pas du métro King. Télétravail possible 3 jours/semaine.`,
    requirements: `• 4+ ans d'expérience backend (Node.js, Go ou Python)
• Maîtrise de PostgreSQL — indexation, transactions, optimisation
• Expérience avec des architectures microservices et systèmes distribués
• Bonne connaissance des pratiques de sécurité (OAuth 2.0, JWT, OWASP)
• Familiarité avec AWS ou GCP (Lambda, RDS, Cloud Run)
• Atout : expérience avec Kafka, Redis ou Temporal`,
    salary_range: '105 000 $ – 140 000 $ CAD',
  },
  {
    title: 'Concepteur(trice) de Produits Senior',
    department: 'Design',
    location: 'Montréal, QC',
    type: 'Full-time',
    description: `Nous cherchons un(e) designer de produits expérimenté(e) pour façonner l'expérience visuelle et interactive de notre plateforme. Vous serez le pont entre les besoins des utilisateurs et la réalité technique, de la recherche jusqu'à la livraison pixel-perfect.

Vos responsabilités :
• Mener des recherches utilisateurs (entretiens, tests d'utilisabilité, A/B tests)
• Concevoir des maquettes et prototypes dans Figma pour les nouvelles fonctionnalités
• Maintenir et faire évoluer notre design system (composants, tokens, documentation)
• Collaborer avec les équipes ingénierie et produit dès la phase de découverte
• Défendre les intérêts des utilisateurs dans les décisions produit
• Présenter vos décisions de design aux parties prenantes avec clarté

Notre équipe design est petite et impactante — vous aurez une influence directe sur l'ensemble du produit. Poste basé à Montréal, télétravail disponible 2 jours/semaine.`,
    requirements: `• 4+ ans en design produit (applications web ou mobile)
• Maîtrise avancée de Figma (composants, auto-layout, variables)
• Portfolio démontrant un processus complet : recherche, wireframes, UI, livraison
• Expérience avec les tests d'utilisabilité et méthodes de recherche qualitative
• Bonne compréhension des contraintes techniques frontend
• Atout : expérience en design system ou accessibilité (WCAG)`,
    salary_range: '95 000 $ – 125 000 $ CAD',
  },
  {
    title: 'Ingénieur(e) DevOps & Infrastructure Cloud',
    department: 'Ingénierie',
    location: 'Vancouver, BC',
    type: 'Full-time',
    description: `Rejoignez notre équipe infrastructure pour transformer notre façon de déployer, monitorer et scaler nos services. Vous construirez des pipelines CI/CD robustes, automatiserez notre infrastructure et assurerez une fiabilité de classe mondiale.

Vos responsabilités :
• Concevoir et gérer notre infrastructure sur AWS (EKS, RDS, CloudFront, S3)
• Écrire et maintenir le code Terraform pour l'infrastructure-as-code
• Optimiser nos pipelines GitHub Actions (build, test, déploiement)
• Mettre en place et améliorer notre stack d'observabilité (Datadog, OpenTelemetry)
• Travailler avec les équipes dev pour améliorer l'expérience développeur (DX)
• Participer à la planification de capacité et aux exercices de chaos engineering

Poste à Vancouver avec télétravail flexible. Notre équipe infrastructure est à l'avant-garde des pratiques DevSecOps au Canada.`,
    requirements: `• 5+ ans en DevOps, SRE ou ingénierie infrastructure
• Expérience solide avec AWS (certifications appréciées)
• Maîtrise de Kubernetes, Helm et des pratiques GitOps
• Très bonne connaissance de Terraform et des principes IaC
• Expérience avec les outils de monitoring et d'alerting (Datadog, PagerDuty)
• Atout : certifications AWS Solutions Architect ou CKA (Kubernetes)`,
    salary_range: '115 000 $ – 150 000 $ CAD',
  },
  {
    title: 'Scientifique des données — IA & Analyse',
    department: 'Data & Intelligence artificielle',
    location: 'Ottawa, ON',
    type: 'Full-time',
    description: `Nous cherchons un(e) scientifique des données pour transformer nos données en insights actionnables et en fonctionnalités intelligentes. Vous travaillerez à l'intersection des statistiques, du machine learning et du développement produit.

Vos responsabilités :
• Concevoir et entraîner des modèles ML pour la personnalisation et la détection d'anomalies
• Analyser de grands ensembles de données pour identifier des opportunités de croissance
• Collaborer avec l'ingénierie pour déployer des modèles en production
• Créer des tableaux de bord et rapports pour les équipes métier
• Implémenter des pipelines de données ETL fiables et scalables
• Assurer la gouvernance des données selon les standards canadiens de confidentialité (LPRPDE)

Notre stack data : Python, PySpark, dbt, Snowflake, Airflow. Basé à Ottawa, avec des interactions régulières avec nos partenaires gouvernementaux.`,
    requirements: `• 3+ ans en data science ou machine learning appliqué
• Maîtrise de Python (pandas, scikit-learn, PyTorch ou TensorFlow)
• Expérience avec SQL avancé et l'optimisation de requêtes analytiques
• Connaissance des pipelines MLOps (MLflow, Weights & Biases)
• Compréhension des enjeux de confidentialité des données (LPRPDE/PIPEDA)
• Atout : expérience avec les LLM, RAG ou NLP en contexte production`,
    salary_range: '100 000 $ – 135 000 $ CAD',
  },
  {
    title: 'Gestionnaire de Produits — Plateforme B2B',
    department: 'Produit',
    location: 'Calgary, AB',
    type: 'Full-time',
    description: `En tant que PM sur notre segment B2B, vous définirez la vision, la stratégie et la roadmap d'une suite de fonctionnalités utilisées par des PME à travers le Canada. Vous travaillerez directement avec les clients, l'ingénierie et la direction.

Vos responsabilités :
• Définir et prioriser la roadmap produit en collaboration avec la direction
• Conduire des entretiens clients et analyser les feedbacks pour identifier les besoins
• Rédiger des PRDs clairs, des user stories et des critères d'acceptation précis
• Travailler en sprints avec les équipes ingénierie et design (Agile/Shape Up)
• Suivre les métriques de succès (activation, rétention, NPS, revenus)
• Coordonner les lancements produits avec le marketing et les ventes

Vous évoluerez dans une culture de prise de décision rapide. Basé à Calgary, télétravail 2 jours/semaine et déplacements occasionnels à Montréal, Toronto, Vancouver.`,
    requirements: `• 4+ ans en gestion de produits (idéalement B2B ou SaaS)
• Capacité à synthétiser données qualitatives et quantitatives en décisions
• Excellentes compétences de communication en français et en anglais
• Expérience avec des outils produit : Jira, Linear, Productboard, Figma
• Sens aigu des priorités et capacité à dire non avec bienveillance
• Atout : expérience avec des produits destinés aux PME canadiennes`,
    salary_range: '100 000 $ – 130 000 $ CAD',
  },
  {
    title: 'Responsable Marketing & Croissance',
    department: 'Marketing',
    location: 'Remote — Canada',
    type: 'Full-time',
    description: `Rejoignez notre équipe pour piloter notre stratégie d'acquisition et de notoriété à travers le Canada. Vous construirez et exécuterez des campagnes multicanales, gérerez notre présence en ligne et développerez des partenariats stratégiques.

Vos responsabilités :
• Élaborer et exécuter la stratégie marketing (contenu, SEO, paid, événements)
• Gérer le budget marketing et optimiser le ratio CAC/LTV
• Créer du contenu de haute qualité pour notre blog, LinkedIn et newsletters
• Collaborer avec les ventes pour aligner les efforts de génération de leads
• Analyser les performances des campagnes et itérer rapidement
• Représenter la marque lors d'événements sectoriels au Canada (2–3 conférences/an)

Poste 100 % remote au Canada. Déplacements occasionnels pour des événements clés.`,
    requirements: `• 4+ ans en marketing B2B, idéalement en SaaS ou tech
• Maîtrise du marketing de contenu, SEO et campagnes payantes (Google Ads, LinkedIn)
• Expérience avec HubSpot, Salesforce ou des CRM similaires
• Excellente plume en français et en anglais
• Analytique : à l'aise avec Google Analytics, Looker ou des outils équivalents
• Atout : réseau dans l'écosystème startup canadien (Waterloo, Montréal, Vancouver)`,
    salary_range: '90 000 $ – 115 000 $ CAD',
  },
  {
    title: 'Développeur(se) Mobile — React Native',
    department: 'Ingénierie',
    location: 'Québec, QC',
    type: 'Full-time',
    description: `Notre application mobile, utilisée par plus de 200 000 Canadiens, a besoin de vous. Vous serez responsable de nouvelles fonctionnalités, de l'optimisation des performances et de l'expérience utilisateur sur iOS et Android.

Vos responsabilités :
• Développer et maintenir notre application React Native (iOS et Android)
• Collaborer avec le design pour des animations et transitions fluides
• Intégrer des APIs backend et gérer l'état applicatif (Redux Toolkit ou Zustand)
• Assurer une couverture de tests solide (Jest, Detox)
• Publier les mises à jour sur l'App Store et Google Play
• Optimiser les performances (temps de démarrage, consommation mémoire)

Poste basé à Québec au sein d'une équipe soudée et bienveillante. Télétravail 3 jours/semaine disponible.`,
    requirements: `• 3+ ans de développement mobile (React Native ou natif iOS/Android)
• Bonne maîtrise de JavaScript et TypeScript
• Expérience avec les APIs REST et la gestion d'état côté client
• Connaissance du cycle de publication App Store et Google Play
• Souci du détail pour les micro-interactions et la fluidité de l'UI
• Atout : expérience avec Expo, Reanimated ou MMKV`,
    salary_range: '95 000 $ – 125 000 $ CAD',
  },
]

async function seed() {
  console.log('Suppression des postes existants...')
  await sql`DELETE FROM job_listings`
  await sql`ALTER SEQUENCE job_listings_id_seq RESTART WITH 1`

  console.log(`Insertion de ${JOBS.length} postes canadiens...`)

  for (const job of JOBS) {
    await sql`
      INSERT INTO job_listings (title, department, location, type, description, requirements, salary_range, is_active)
      VALUES (${job.title}, ${job.department}, ${job.location}, ${job.type}, ${job.description}, ${job.requirements}, ${job.salary_range}, true)
    `
    console.log(`  ✓ ${job.title} — ${job.location}`)
  }

  const count = await sql`SELECT COUNT(*) AS n FROM job_listings`
  console.log(`\n✅ ${count[0].n} postes insérés avec succès.`)
}

seed().catch(err => { console.error(err); process.exit(1) })

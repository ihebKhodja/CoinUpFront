/src
├── app
│ ├── core
│ │ ├── guards
│ │ ├── interceptors
│ │ ├── services
│ │ ├── utils
│ │ ├── models
│ │ ├── layout
│ │ │ ├── main-layout
│ │ │ ├── header
│ │ │ └── sidebar
│ │ └── core.config.ts
│
│ ├── shared
│ │ ├── components
│ │ ├── directives
│ │ ├── pipes
│ │ └── index.ts ← replaces shared.module.ts
│
│ ├── features
│ │ ├── auth
│ │ │ ├── login
│ │ │ ├── register
│ │ │ └── forgot-password
│ │
│ │ ├── home
│ │ │ ├── pages
│ │ │ └── components
│ │
│ │ ├── coin
│ │ │ ├── pages
│ │ │ └── components
│ │
│ │ ├── wallet
│ │ │ ├── pages
│ │ │ └── components
│ │
│ │ ├── notifications
│ │ │ ├── pages
│ │ │ └── components
│
│ ├── app.routes.ts
│ └── app.component.ts
│
├── assets
├── environments
└── styles.css

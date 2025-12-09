/src
├── app
│ ├── core
│ │ ├── guards
│ │ │ └── auth.guard.ts
│ │ ├── interceptors
│ │ │ └── auth.interceptor.ts
│ │ ├── services
│ │ │ ├── auth.service.ts
│ │ │ ├── coins.service.ts
│ │ │ ├── wallet.service.ts
│ │ │ ├── notification.service.ts
│ │ ├── utils
│ │ ├── models
│ │ │ ├── coin.model.ts  
 │ │ │ ├── user.model.ts
│ │ │ ├── wallet.model.ts
│ │ │ └── notification.model.ts
│ │ ├── layout
│ │ │ ├── main-layout.component.ts
│ │ │ └── header / sidebar
│ │ └── core.config.ts
│ │
│ ├── shared
│ │ ├── components
│ │ │ ├── card
│ │ │ ├── loader
│ │ │ ├── empty-state
│ │ ├── directives
│ │ ├── pipes
│ │ │ └── format-number.pipe.ts
│ │ └── shared.module.ts (optional)
│ │
│ ├── features
│ │ ├── auth
│ │ │ ├── login
│ │ │ ├── register
│ │ │ └── forgot-password
│ │ │
│ │ ├── home
│ │ │ ├── pages
│ │ │ │ └── home-page.component.ts
│ │ │ └── components
│ │ │ └── coin-card.component.ts
│ │
│ │ ├── coin
│ │ │ ├── pages
│ │ │ │ └── coin-details.component.ts
│ │ │ ├── components
│ │ │ │ ├── chart.component.ts
│ │ │ │ └── coin-header.component.ts
│ │
│ │ ├── wallet
│ │ │ ├── pages
│ │ │ │ └── wallet-page.component.ts
│ │ │ ├── components
│ │ │ │ ├── wallet-card.component.ts
│ │ │ │ └── deposit-dialog.component.ts
│ │
│ │ ├── notifications
│ │ │ ├── pages
│ │ │ │ └── notification-center.component.ts
│ │ │ └── components
│ │ │ └── notification-item.component.ts
│ │
│ ├── app.routes.ts
│ └── app.component.ts
│
├── assets
├── environments
└── styles.css

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { BOOK_REPOSITORY, CATALOG_REPOSITORY } from './infrastructure/di/tokens';
import { HttpBookRepository } from './infrastructure/http/http-book-repository';
import { HttpCatalogRepository } from './infrastructure/http/http-catalog.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    { provide: BOOK_REPOSITORY, useClass: HttpBookRepository },
    { provide: CATALOG_REPOSITORY, useClass: HttpCatalogRepository },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-light',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng' // Keeps Tailwind tokens primary
          }
        }
      },
      // Note: This is Community license issued to Cyrus Kasra by PrimeStore
      license: 'eyJpZCI6IjViOWU1NDNjLWFmNzgtNDA2NC05NjI0LWI3YThiYmZlOTIzMSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTEyMjUzMjIsImV4cCI6MTgyMjc2MTMyMn0.KUFZ-1_wLhcpLiRQHuOEa6KBG62aGIJx8l89y8s-XDP9Vaojs50Wa_1Oow6BBI9mt_bg_a2UFQk1w-oY1phADA'
    })
  ]
};


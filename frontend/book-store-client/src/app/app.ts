import { Component, signal } from '@angular/core';
import { HeaderComponent } from './presentation/layout/header/header.component';
import { BodyComponent } from './presentation/layout/body/body.component';
import { FooterComponent } from './presentation/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, BodyComponent, FooterComponent],
  // CHANGE THIS LINE:
  templateUrl: './app.component.html', 
})
export class AppComponent {
  title = 'book-store-client';
}
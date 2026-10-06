import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="p-4 text-center text-xsm border-t border-gray-700" style="font-size:.8em;">
      <p>© 2026 Lockheed Martin Test Project -- BookStore Client Demo - Cyrus Kasra - <a href="mailto:info@cyruskasra.com" target=_mail>info@cyruskasra.com</a></p>
    </footer>
  `
})
export class FooterComponent {}
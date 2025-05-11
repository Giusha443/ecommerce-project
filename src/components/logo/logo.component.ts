import { MatButton } from '@angular/material/button';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';

const OUR_APP_LOGO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill=none>
<path d="M32.28 20.97 45.6 7.65C47.11 6.14 49.15 5.3 51.28 5.3 55.72 5.3 59.32 8.9 59.32 13.34 59.32 15.48 58.46 17.52 56.97 19.02L52.05 23.94C50.54 25.45 48.5 26.29 46.37 26.29 43.51 26.29 41.02 24.81 39.6 22.57L42.73 19.44C43.22 20.98 44.68 22.08 46.38 22.08 47.4 22.08 48.38 21.68 49.1 20.96L54.02 16.04C54.74 15.32 55.14 14.34 55.14 13.32 55.14 11.2 53.42 9.48 51.3 9.48 50.28 9.48 49.3 9.88 48.58 10.6L35.26 23.92C33.75 25.43 31.71 26.27 29.73 26.27 26.87 26.27 24.38 24.79 22.96 22.55L26.09 19.42C26.58 20.96 28.04 22.06 29.74 22.06 30.76 22.06 31.74 21.66 32.46 20.94ZM17.67 5.3C15.53 5.3 13.51 6.14 11.99 7.65L7.07 12.57C5.57 14.07 4.72 16.12 4.72 18.25 4.72 22.69 8.32 26.29 12.76 26.29 14.9 26.29 16.92 25.45 18.44 23.94L21.84 20.54S21.84 20.54 21.84 20.54L31.76 10.62C32.48 9.9 33.46 9.5 34.48 9.5 36.18 9.5 37.63 10.61 38.13 12.14L41.26 9.01C39.82 6.77 37.33 5.29 34.49 5.29 32.35 5.29 30.33 6.13 28.81 7.64L15.49 20.96C14.75 21.68 13.79 22.08 12.77 22.08 10.65 22.08 8.93 20.36 8.93 18.24 8.93 17.22 9.33 16.24 10.05 15.52L14.97 10.6C15.69 9.88 16.67 9.48 17.69 9.48 19.39 9.48 20.84 10.59 21.34 12.12L24.47 8.99C23.03 6.75 20.54 5.27 17.7 5.27Z" fill="currentColor"/>
</svg>`;

@Component({
  selector: 'app-logo',
  imports: [MatButton, MatIconModule],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIconLiteral(
      'this-app-logo-icon',
      this.domSanitizer.bypassSecurityTrustHtml(OUR_APP_LOGO_ICON)
    );
  }
}

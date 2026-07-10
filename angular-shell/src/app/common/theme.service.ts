import { effect, inject, Injectable, DOCUMENT } from "@angular/core";
import { MfeStateService } from "@dever-labs/ngx-mfe-broker";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly mfeState = inject(MfeStateService);

  get theme(): string {
    return this.mfeState.get<string>('theme')();
  }

  constructor() {
    effect(() => {
      this.applyTheme(this.mfeState.get<string>('theme')());
    });
  }

  private applyTheme(theme: string): void {
    const body = this.document.body;
    if (theme === 'dark-theme' || theme.includes('dark')) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }
}

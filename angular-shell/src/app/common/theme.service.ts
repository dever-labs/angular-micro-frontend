import { effect, inject, Injectable, DOCUMENT } from "@angular/core";
import { injectAppState } from "@app/mfe-state-model";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly state = injectAppState();

  get theme(): string {
    return this.state.theme();
  }

  constructor() {
    effect(() => {
      this.applyTheme(this.state.theme());
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

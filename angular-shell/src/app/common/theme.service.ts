import { effect, inject, Injectable, DOCUMENT } from "@angular/core";
import { AppStateService } from "@czprz/broker";
import { ConfigFacadeService } from "./config/config-facade.service";


@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  get theme(): string {
    return this.appState.theme();
  }

  constructor(
    private readonly appState: AppStateService,
    private readonly configFacade: ConfigFacadeService,
  ) {
    effect(() => {
      this.applyTheme(this.appState.theme());
    });
  }

  public start(): void {
    const persisted = this.configFacade.getTheme();
    if (persisted) {
      this.appState.theme.set(persisted);
    }
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


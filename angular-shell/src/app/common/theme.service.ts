import { Inject, Injectable, DOCUMENT } from "@angular/core";
import { BrokerService } from "@czprz/broker";
import { ConfigFacadeService } from "./config/config-facade.service";


@Injectable({
  providedIn: "root",
})
export class ThemeService {
  public theme: string = "";

  constructor(
    private readonly broker: BrokerService,
    private readonly configFacade: ConfigFacadeService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  public start(): void {
    const theme = this.configFacade.getTheme() || "light-theme";
    this.changeTheme(theme);

    this.broker.get$<string>("theme").subscribe((theme) => {
      this.changeTheme(theme);
      this.configFacade.setTheme(theme);
    });
  }

  private changeTheme(theme: string): void {
    const header = this.document.getElementsByTagName("head")[0];
    let themeLink = this.document.getElementById(
      "theme-css"
    ) as HTMLLinkElement;

    if (!themeLink) {
      themeLink = this.document.createElement("link");
      themeLink.id = "theme-css";
      themeLink.rel = "stylesheet";
      header.appendChild(themeLink);
    }

    themeLink.href = theme + ".css";

    this.theme = theme;
  }
}

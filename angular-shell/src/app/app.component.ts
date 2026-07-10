import { Component, HostListener, inject, DOCUMENT, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "./common/theme.service";
import { MenuComponent } from "./menu/menu.component";
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { FooterComponent } from "./footer/footer.component";
import { CommandPaletteComponent } from "./command-palette/command-palette.component";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: true,
    imports: [RouterOutlet, MenuComponent, ToolbarComponent, FooterComponent, CommandPaletteComponent],
})
export class AppComponent implements OnInit {
  private readonly document = inject(DOCUMENT);

  // Inject ThemeService to eagerly start its effect.
  private readonly _theme = inject(ThemeService);

  @HostListener('window:scroll')
  onScroll() {
    // @ts-ignore
    document.documentElement.dataset['scroll'] = window.scrollY;
  }

  ngOnInit(): void {
    this.onScroll();
  }
}

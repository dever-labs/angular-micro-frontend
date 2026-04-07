import {Component, HostListener, inject, DOCUMENT} from "@angular/core";
import { ThemeService } from "./common/theme.service";


@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);

  @HostListener('window:scroll')
  onScroll() {
    // @ts-ignore
    document.documentElement.dataset['scroll'] = window.scrollY;
  }

  constructor(private readonly theme: ThemeService) {}

  ngOnInit(): void {
    this.theme.start();
    this.onScroll();
  }
}

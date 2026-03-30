import {Component, HostListener, Inject} from "@angular/core";
import { PrimeNGConfig } from "primeng/api";
import { ThemeService } from "./common/theme.service";
import {DOCUMENT} from "@angular/common";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})
export class AppComponent {
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    // @ts-ignore
    document.documentElement.dataset['scroll'] = window.scrollY;
  }

  constructor(
    private readonly primeNgConfig: PrimeNGConfig,
    private readonly theme: ThemeService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  // TODO: Fix content grid-area sometimes not being within screen width
  // TODO: Fix issue with delay when loading theme

  ngOnInit(): void {
    this.primeNgConfig.ripple = true;
    this.theme.start();

    this.onScroll();
  }
}

import {Component, HostListener, Inject, DOCUMENT} from "@angular/core";
import { ThemeService } from "./common/theme.service";


@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})
export class AppComponent {
  @HostListener('window:scroll')
  onScroll() {
    // @ts-ignore
    document.documentElement.dataset['scroll'] = window.scrollY;
  }

  constructor(
    private readonly theme: ThemeService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    this.theme.start();
    this.onScroll();
  }
}

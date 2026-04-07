import { AfterViewInit, Component, ViewChild, ViewContainerRef } from "@angular/core";
import { loadRemoteModule } from "@angular-architects/native-federation";

@Component({
    selector: "app-toolbar",
    templateUrl: "./toolbar.component.html",
    styleUrls: ["./toolbar.component.scss"],
    standalone: false
})
export class ToolbarComponent implements AfterViewInit {
  @ViewChild("toolbarPlaceholder", { read: ViewContainerRef }) toolbarPlaceholder!: ViewContainerRef;

  async ngAfterViewInit(): Promise<void> {
    try {
      const m = await loadRemoteModule('toolbar', './Component');
      this.toolbarPlaceholder.createComponent(m.ToolbarComponent);
    } catch (err) {
      console.error('[shell] Failed to load toolbar remote:', err);
    }
  }
}

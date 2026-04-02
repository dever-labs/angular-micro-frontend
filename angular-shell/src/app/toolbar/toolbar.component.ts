import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { loadRemoteModule } from "@angular-architects/native-federation";

@Component({
    selector: "app-toolbar",
    templateUrl: "./toolbar.component.html",
    styleUrls: ["./toolbar.component.scss"],
    standalone: false
})
export class ToolbarComponent implements OnInit {
  @ViewChild("toolbarPlaceholder", { read: ViewContainerRef }) toolbarPlaceholder!: ViewContainerRef;

  constructor() {}

  async ngOnInit(): Promise<void> {
    const m = await loadRemoteModule('toolbar', './Component');
    this.toolbarPlaceholder.createComponent(m.ToolbarComponent);
  }
}

import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { loadRemoteModule } from '@angular-architects/module-federation';

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
    const m = await loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost/getModule/toolbar/remoteEntry.js',
      exposedModule: './Component'
    });

    this.toolbarPlaceholder.createComponent(m.ToolbarComponent);
  }
}

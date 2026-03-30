import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { loadRemoteModule } from "@angular-architects/module-federation";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"],
    standalone: false
})
export class MenuComponent implements OnInit {
  @ViewChild("menuPlaceholder", { read: ViewContainerRef })
  menuPlaceholder!: ViewContainerRef;

  constructor() {}

  async ngOnInit(): Promise<void> {
    const m = await loadRemoteModule({
      type: "module",
      remoteEntry: "http://localhost/getModule/menu/remoteEntry.js",
      exposedModule: "./Component",
    });

    this.menuPlaceholder.createComponent(m.MenuComponent);
  }
}

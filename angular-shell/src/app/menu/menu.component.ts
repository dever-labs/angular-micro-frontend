import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { loadRemoteModule } from "@angular-architects/native-federation";

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
    const m = await loadRemoteModule('menu', './Component');
    this.menuPlaceholder.createComponent(m.MenuComponent);
  }
}

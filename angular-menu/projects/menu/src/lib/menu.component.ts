import { Component, computed, inject } from "@angular/core";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { MenuRegistryService } from '@czprz/broker';

@Component({
    selector: "lib-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"],
    standalone: true,
    imports: [RouterLink, ButtonModule, InputTextModule],
})
export class MenuComponent {
  private readonly menuRegistry = inject(MenuRegistryService);

  readonly groups = computed(() => {
    const groupMap = new Map<string, { label: string; path: string; icon?: string }[]>();
    for (const item of this.menuRegistry.items()) {
      const key = item.group ?? 'Menu';
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push({ label: item.label, path: item.path, icon: item.icon });
    }
    return Array.from(groupMap.entries()).map(([label, items]) => ({ label, items }));
  });
}

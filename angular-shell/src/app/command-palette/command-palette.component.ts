import { inject,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { injectAppState } from '@app/mfe-state-model';

@Component({
  selector: 'app-command-palette',
  templateUrl: './command-palette.component.html',
  styleUrls: ['./command-palette.component.scss'],
  standalone: true,
})
export class CommandPaletteComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private readonly router = inject(Router);
  private readonly state = injectAppState();

  readonly visible = signal(false);
  readonly query = signal('');
  readonly activeIndex = signal(0);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const items = this.state.menu();
    return q ? items.filter(i => i.label.toLowerCase().includes(q)) : items;
  });

  readonly showGroups = computed(() => {
    const groups = new Set(this.filtered().map(i => i.group ?? ''));
    return groups.size > 1;
  });

  constructor() {
    effect(() => {
      const _ = this.state.searchOpen();
      if (this.state.searchOpen() > 0) this.open();
    }, { allowSignalWrites: true });
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    const inInput = tag === 'input' || tag === 'textarea' || tag === 'select';

    if (!this.visible()) {
      if (event.key === 's' && !inInput && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        this.open();
      }
      return;
    }

    switch (event.key) {
      case 'Escape': this.close(); break;
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => Math.min(i + 1, this.filtered().length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        this.selectActive();
        break;
    }
  }

  open(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.visible.set(true);
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  close(): void { this.visible.set(false); }

  onQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  navigate(path: string): void {
    this.router.navigate(['/' + path]);
    this.close();
  }

  private selectActive(): void {
    const item = this.filtered()[this.activeIndex()];
    if (item) this.navigate(item.path);
  }
}

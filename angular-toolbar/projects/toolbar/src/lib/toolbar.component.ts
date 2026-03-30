import { Component, OnInit } from '@angular/core';
import { BrokerService } from '@czprz/broker';

@Component({
    selector: 'lib-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    standalone: false
})
export class ToolbarComponent implements OnInit {
  constructor(private readonly broker: BrokerService) {}

  ngOnInit(): void {}

  public changeTheme(theme: string): void {
    this.broker.set('theme', theme);
  }
}

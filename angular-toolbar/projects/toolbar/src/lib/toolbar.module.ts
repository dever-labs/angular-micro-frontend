import { NgModule } from '@angular/core';
import { ToolbarComponent } from './toolbar.component';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { BrokerModule } from '@czprz/broker';

@NgModule({
  declarations: [ToolbarComponent],
  imports: [ButtonModule, PopoverModule, MenuModule, BrokerModule],
  exports: [ToolbarComponent],
})
export class ToolbarModule {}

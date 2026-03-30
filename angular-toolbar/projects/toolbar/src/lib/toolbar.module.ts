import { NgModule } from '@angular/core';
import { ToolbarComponent } from './toolbar.component';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { BrokerModule } from '@czprz/broker';

@NgModule({
  declarations: [ToolbarComponent],
  imports: [ButtonModule, PopoverModule, BrokerModule],
  exports: [ToolbarComponent],
})
export class ToolbarModule {}

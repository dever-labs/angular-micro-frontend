import { NgModule } from '@angular/core';
import { BrokerService } from './broker.service';
import { ConfigRepositoryService } from './config/config-repository.service';
import { ConfigFacadeService } from './config/config-facade.service';

@NgModule({
  declarations: [],
  providers: [BrokerService, ConfigRepositoryService, ConfigFacadeService],
})
export class BrokerModule {}

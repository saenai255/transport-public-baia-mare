import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs.router.module';

import { TabsPage } from './tabs.page';
import { BusesPage } from './pages/buses/buses.page';
import { StationsPage } from './pages/stations/stations.page';
import { BusPageComponent } from './pages/bus/bus.page.component';
import { GoogleMapsComponent } from './components/google-map/google-maps.component';
import { StationPageComponent } from './pages/station/station.page.component';
import { LoadingComponent } from './components/loading/loading.component';
import { GeoService } from '../../shared/services/geo.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    HttpClientModule
  ],
  providers: [
      GeoService
  ],
  declarations: [TabsPage, BusesPage, StationsPage, BusPageComponent, GoogleMapsComponent, StationPageComponent, LoadingComponent]
})
export class TabsPageModule {}

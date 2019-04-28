import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { BusesPage } from './pages/buses/buses.page';
import { StationsPage } from './pages/stations/stations.page';
import { BusPageComponent } from './pages/bus/bus.page.component';
import { StationPageComponent } from './pages/station/station.page.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'buses',
        children: [
          {
            path: '',
            component: BusesPage,
            pathMatch: 'full'
          },
          {
            path: ':id',
            component: BusPageComponent
          }
        ]
      },
      {
        path: 'stations',
        children: [
          {
            path: '',
            component: StationsPage,
            pathMatch: 'full'
          },
          {
            path: ':id',
            component: StationPageComponent
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/buses',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/buses',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}

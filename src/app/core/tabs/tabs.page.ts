import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  template: `
  <ion-tabs>

    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="buses">
        <ion-icon name="bus"></ion-icon>
        <ion-label>Busuri</ion-label>
      </ion-tab-button>
  
      <ion-tab-button tab="stations">
        <ion-icon name="pin"></ion-icon>
        <ion-label>Statii</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  
  </ion-tabs>
`,
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {}

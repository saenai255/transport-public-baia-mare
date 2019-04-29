import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-loading',
    template: `
        <div class="loading">Loading&#8230;</div>
    `,
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit, OnDestroy {
    @Input() coords: { x: number, y: number};

    private timeoutId: number;
    map: any;

    constructor(private toastController: ToastController) { }

    ngOnInit() {
        this.timeoutId = setTimeout(async () => {
            const toast = await this.toastController.create({
                header: 'Eroare 😱',
                message: 'Aplicatia nu s-a putut conecta la internet',
                position: 'top',
                keyboardClose: false
            });
            toast.present();
        }, 15 * 1000);
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeoutId);
    }
}

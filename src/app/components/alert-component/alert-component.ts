import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, signal, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertService } from '../../services/alert-service';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'alert-component',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './alert-component.html',
  styleUrl: './alert-component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AlertComponent {

  private readonly alertService = inject(AlertService);
  private readonly offcanvasService = inject(NgbOffcanvas);
  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('notification');

  notifications = signal<any[]>([]);
  alertRes = this.alertService.getAlertListResource();

  constructor(){
    // this.addNotification();
    // effect(() => {
    //    const notifications = this.notifications(); 
    //   const container = this.scrollContainer();
    //   if(container && notifications.length) {
    //     setTimeout(() => {
    //       const el = container.nativeElement;
    //       el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); 
    //     }, 50);
    //   }
    // });
  }

  toggleNotification(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', scroll: true, keyboard: false, });
    this.alertRes.reload();
  }

  addNotification() {
    const id = setInterval(() => {
      if(this.notifications().length >= 50){ clearInterval(id); return; }

      const alertTypes = ['success', 'danger', 'warning', 'info', 'primary'];
      const random = Math.floor(Math.random() * alertTypes.length);

      this.notifications.update(prev => [
        ...prev, 
        {type: alertTypes[random], message: `Http failure response for rdpms/backend/api/alert_live_status_count/All/All/All/All/All: 401 Unauthorized` }
      ]);
    }, 5000);
  }

}

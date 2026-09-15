import { Component, inject, TemplateRef, computed, debounced, signal, OnInit, effect } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NgxPrintDirective } from 'ngx-print';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectDirectiveModule, PageHeaderComponent } from '@rdpms/shared/components';
import { GlobalUtility } from '@rdpms/shared/utility';
import { schema, required, form, apply, disabled, submit, FormField, FormRoot, minLength } from '@angular/forms/signals';
import { InputService } from '../../../services/input-service';
import { ToastService } from '@rdpms/core/services';
import { AlertService } from '../../../services/alert-service';
import { CommonModule } from '@angular/common';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
  alertType: string;
  assetType: string;
}

@Component({
  selector: 'alert-live-component',
  imports: [CommonModule, FormField, FormRoot, FormsModule, PageHeaderComponent, NgxPrintDirective, NgbModalModule, MultiSelectDirectiveModule ],
  templateUrl: './alert-live-component.html',
  styleUrl: './alert-live-component.scss',
})
export class AlertLiveComponent implements OnInit {

  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);
  private inputService = inject(InputService);
  private globalUtility = inject(GlobalUtility)
    
  readonly formModel: SearchFormModel = {
    zone: 'All',
    division: 'All',
    station: 'All',
    alertType: 'All',
    assetType: 'All',
  }

  readonly model = signal(this.formModel);
  readonly records = signal<any[] | null>(null);
  readonly summary = signal<any[] | null>(null);
  
  debouncedZone = debounced(computed(() => this.model().zone), 500);
  debouncedDivision = debounced(computed(() => this.model().division), 500);
  
  zonesRes = this.inputService.getZoneListResource();
  alertTypesRes = this.inputService.getAlertTypeListResource();
  assetTypesRes = this.inputService.getAssetTypeListResource();
  divisionsRes = this.inputService.getDivisionListResource(this.debouncedZone.value);
  stationsRes = this.inputService.getStationListResource(this.debouncedZone.value, this.debouncedDivision.value);

  readonly formSchema = schema<SearchFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    minLength(fieldPath.zone, 1, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.alertType, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
  });

  readonly f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, { 
      when: () => this.f().submitting() 
    });
    disabled(s.zone, {
      when: (ctx) =>{
        return this.zonesRes.isLoading();
      }
    });
    disabled(s.division, { 
      when: (ctx) => {
        const currZone = ctx.valueOf(s.zone);
        return !currZone?.length || this.divisionsRes.isLoading() || this.debouncedZone.value() !== currZone;
      } 
    });
    disabled(s.station, 
      { when: (ctx) => {
        const currDivision = ctx.valueOf(s.division);
        return !currDivision || this.stationsRes.isLoading() || this.debouncedDivision.value() !== currDivision;
      }
    });
  });
  
  constructor() {
    const toastOptions = { classname: 'bg-danger text-white', delay: 5000 };
    effect(() => {
      const zoneError = this.zonesRes.error();
      if(zoneError) { this.toastService.show(this.globalUtility.getErrorMessage(zoneError), toastOptions); }

      const divisionError = this.divisionsRes.error();
      if(divisionError) { this.toastService.show(this.globalUtility.getErrorMessage(divisionError), toastOptions); }

      const stationError = this.stationsRes.error();
      if(stationError) { this.toastService.show(this.globalUtility.getErrorMessage(stationError), toastOptions); }

      const alertTypeError = this.alertTypesRes.error();
      if(alertTypeError) { this.toastService.show(this.globalUtility.getErrorMessage(alertTypeError), toastOptions); }

      const assetTypeError = this.assetTypesRes.error();
      if(assetTypeError) { this.toastService.show(this.globalUtility.getErrorMessage(assetTypeError), toastOptions); }
    });
  }

  ngOnInit(): void {
    this.getAlertLiveStatusSummary(this.f().value());
    this.loadAlertLiveStatusList(this.f().value());
  }

  async getAlertLiveStatusSummary(payload: Partial<SearchFormModel>) {
    try {
      // this.records.set(null);
      const response = await firstValueFrom(this.alertService.getAlertLiveStatusSummary(payload));
      this.summary.set(response ?? []);
    } catch (error: any) {
      this.summary.set([]);
      this.toastService.show(
        this.globalUtility.getErrorMessage(error),
        { classname: 'bg-danger text-white', delay: 5000 }
      );
    }
  }

  async loadAlertLiveStatusList(payload: Partial<SearchFormModel>) {
    try {
      // this.records.set(null);
      const response = await firstValueFrom(this.alertService.getAlertLiveStatusList(payload));
      this.records.set(response ?? []);
    } catch (error: any) {
      this.records.set([]);
      this.toastService.show(
        this.globalUtility.getErrorMessage(error),
        { classname: 'bg-danger text-white', delay: 5000 }
      );
    }
  }

  onZoneChange() {
    this.f.division().reset();
    this.f.station().reset();
    // this.model.update((m) => ({ ...m, division: 'All', station: 'All' }));
  }

  onDivisionChange() {
    this.f.station().reset();
    // this.model.update((m) => ({ ...m, station: 'All' }));
  }

  async onSubmit(event: SubmitEvent) {
    event.preventDefault();
    await submit(this.f, async (formInstance) => {
      const formValue = formInstance().value();
      await this.getAlertLiveStatusSummary(formValue);
      await this.loadAlertLiveStatusList(formValue);
    });
  }

  openFeedbackModal(templateRef: TemplateRef<any>, record: any, feedbackCode: string) {
    
    const modalRef = this.modalService.open(templateRef, { 
      keyboard: false, centered: true, scrollable: true, fullscreen: false, animation: true, backdrop: 'static', size: 'md', role: 'alertdialog', 
    });
    modalRef.result.then(
        (result: any) => { console.log(result); },
        (reason: any) => { console.log(reason); },
      ).catch((reason: any) => { console.log(reason); });
  }

  feedbackSubmit(form: NgForm, activeModal: NgbActiveModal, data: any) {
    if(form.invalid) { form.form.markAllAsTouched(); return; }
    
    const payload = {...form.value, feedbackCode: data.feedbackCode }
    this.alertService.postAlertFeedback(data.record.alertId, payload).subscribe({
      next: (response: any) => {
        activeModal.close('success');
        this.toastService.show(
          this.globalUtility.getErrorMessage(response.message), 
          { classname: 'bg-success text-white', delay: 5000 } 
        );
      },
      error: (error: any) => {
        this.toastService.show(
          this.globalUtility.getErrorMessage(error),
          { classname: 'bg-danger text-white', delay: 5000 }
        );
      }
    });
  }
}

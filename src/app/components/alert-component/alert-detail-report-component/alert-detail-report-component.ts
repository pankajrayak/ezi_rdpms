import { DatePipe } from '@angular/common';
import { Component, inject, AfterViewInit, computed, debounced, signal, effect, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { apply, disabled, FieldTree, form, FormField, FormRoot, required, schema, submit, validateTree } from '@angular/forms/signals';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { NgxPrintDirective } from 'ngx-print';
import { firstValueFrom, of } from 'rxjs';
import { InputService } from '../../../services/input-service';
import { AlertDetail, AlertService } from '../../../services/alert-service';
import { ToastService } from '@rdpms/core/services';
import { GlobalUtility } from '@rdpms/shared/utility';

@Component({
  selector: 'alert-detail-report-component',
  imports: [DatePipe, FormField, FormRoot, NgxPrintDirective, PageHeaderComponent],
  templateUrl: './alert-detail-report-component.html',
  styleUrl: './alert-detail-report-component.scss',
})
export class AlertDetailReportComponent implements OnInit, AfterViewInit {

  private toastService = inject(ToastService);
  private alertService = inject(AlertService);
  private inputService = inject(InputService);
  private globalUtility = inject(GlobalUtility);
  
  readonly formModel: AlertDetail = {
    zone: 'All',
    division: 'All',
    station: 'All',
    alertType: 'All',
    assetType: 'All',
    assetNumber: 'All',
    alertFeedback: 'All',
    cause: 'All',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
  }

  readonly model = signal(this.formModel);
  readonly records = signal<any[] | null>(null);

  debouncedZone = debounced(computed(() => this.model().zone), 500);
  debouncedDivision = debounced(computed(() => this.model().division), 500);
  
  zonesRes = this.inputService.getZoneListResource();
  alertTypesRes = this.inputService.getAlertTypeListResource();
  assetTypesRes = this.inputService.getAssetTypeListResource();
  divisionsRes = this.inputService.getDivisionListResource(this.debouncedZone.value);
  stationsRes = this.inputService.getStationListResource(this.debouncedZone.value, this.debouncedDivision.value);

  assetNumbersRes = rxResource({ stream: () => of(['PT-01', 'PT-02', 'PT-03', 'PT-04']) });
  alertFeedbacksRes = rxResource({ stream: () => of(['T', 'F', 'M']) });
  causesRes = rxResource({ stream: () => of(['PT_N_VOLT_LOW']) });
  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) });
  
  readonly formSchema = schema<Required<AlertDetail>>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.alertType, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
    required(fieldPath.assetNumber, { message: 'required field' });
    required(fieldPath.alertFeedback, { message: 'required field' });
    required(fieldPath.cause, { message: 'required field' });
    required(fieldPath.fromDate, { message: 'required field' });
    required(fieldPath.fromTime, { message: 'required field' });
  });

  readonly f = form<Required<AlertDetail>>(this.model as any, (s) => {
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
        return !currZone || this.divisionsRes.isLoading() || this.debouncedZone.value() !== currZone;
      } 
    });
    disabled(s.station, 
      { when: (ctx) => {
        const currDivision = ctx.valueOf(s.division);
        return !currDivision || this.stationsRes.isLoading() || this.debouncedDivision.value() !== currDivision;
      }
    });
    validateTree(s, (ctx) => {
      const { fromDate, fromTime, toDate, toTime } = ctx.valueOf(s);
      
      if(fromDate && toDate && toDate < fromDate){
        return { kind: 'dateBeforeFrom', message: `Date must be on or after ${fromDate}`, fieldTree: ctx.fieldTree.toDate }
      }

      if(fromTime && toTime && fromDate === toDate) {
        const fromMins = this.timeTOMinutes(fromTime);
        const toMins = this.timeTOMinutes(toTime);

        if(fromMins > toMins) {
          return { kind: 'timeBeforeFrom', message: `Time must be on or after ${fromTime}`, fieldTree: ctx.fieldTree.toTime }
        }
      }
      return null;
    });
  });

  timeTOMinutes(timeStr: string): number {
    if(!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
  }

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
    this.loadAlertDetailList(this.f().value());
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.f().reset(); }, 100);
  }

  onDateTimeChanged(event: Event, formCtrl: FieldTree<string | null>){
    const input = event.target as HTMLInputElement;
    if(!input.value) {
      formCtrl().value.set('');
      input.blur(); input.focus();
    }
  }
  
  async loadAlertDetailList(payload: Partial<AlertDetail>) {
    try {
      // this.records.set(null);
      const response = await firstValueFrom(this.alertService.getAlertDetailList(payload));
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
    this.model.update((m) => ({ ...m, division: 'All', station: 'All' }));
  }

  onDivisionChange() {
    this.f.station().reset();
    this.model.update((m) => ({ ...m, station: 'All' }));
  }

  async onSubmit(event: SubmitEvent) {
    event.preventDefault();
    await submit(this.f, async (formInstance) => {
      const formValue = formInstance().value();
      await this.loadAlertDetailList(formValue);
    });
  }

}

import { Component, inject, TemplateRef, computed, debounced, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom, of } from 'rxjs';
import { NgxPrintDirective } from 'ngx-print';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectDirectiveModule, PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';
import { rxResource } from '@angular/core/rxjs-interop';
import { schema, required, form, apply, disabled, submit, FormField, FormRoot, minLength } from '@angular/forms/signals';

interface SearchFormModel {
  zone: string[];
  division: string;
  station: string;
  alertType: string;
  assetType: string;
}

@Component({
  selector: 'alert-live-component',
  imports: [FormField, FormRoot, FormsModule, PageHeaderComponent, NgxPrintDirective, NgbModalModule, MultiSelectDirectiveModule ],
  templateUrl: './alert-live-component.html',
  styleUrl: './alert-live-component.scss',
})
export class AlertLiveComponent {
  private dataService = inject(DataService);
  private modalService = inject(NgbModal);
  
  readonly summary = signal<any>([{l:'Predictive', v:4, c:'warning'}, {l:'Failure', v:6, c:'danger'}, {l:'Total', v:10, c:'primary'}]);

  readonly formModel: SearchFormModel = {
    zone: [],
    division: '',
    station: '',
    alertType: 'All',
    assetType: 'All',
  }

  readonly records = signal(<any>[]);
  readonly model = signal(this.formModel);

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
    disabled(s, { when: () => this.f().submitting() });
    disabled(s.division, { 
      when: (ctx) => {
        const currZone = ctx.valueOf(s.zone) ?? [];
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
  
  zonesRes = rxResource({ stream: () => this.dataService.getZones() ?? of([]) });
  alertTypesRes = rxResource({ stream: () => this.dataService.getAlertTypes() ?? of([]) });
  assetTypesRes = rxResource({ stream: () => this.dataService.getAssetTypes() ?? of([]) });
  
  debouncedZone = debounced(computed(() => this.model().zone), 500);
  divisionsRes = rxResource({
    params: () => {
      const z = this.debouncedZone.value();
      return z && z.length && z[0].trim() !== '' ? z : undefined; 
      // return typeof z === 'string' && z.trim() !== '' ? z : z;
    },
    stream: ({ params: z }) => (z ? this.dataService.getDivisions(z[0]) : of([])),
  });

  debouncedDivision = debounced(computed(() => this.model().division), 500);
  stationsRes = rxResource({
    params: () => {
      const d = this.debouncedDivision.value();
      return d && d.trim() !== '' ? d : undefined;
    },
    stream: ({ params: d }) => (d ? this.dataService.getStations(d) : of([])),
  });

  onZoneChange() {
    this.f.division().reset();
    this.f.station().reset();
    this.model.update((m) => ({ ...m, division: '', station: '' }));
  }

  onDivisionChange() {
    this.f.station().reset();
    this.model.update((m) => ({ ...m, station: '' }));
  }

  async onSubmit(event: SubmitEvent) {
    event.preventDefault();
    await submit(this.f, async (formInstance) => {
      try {
        const payload = formInstance().value();
        const response = await firstValueFrom(this.dataService.getPagedRecord(1, 10, { station: 'CSMT' }));
        console.log('Search complete:', response);
        this.records.set(data);
      } catch (error) {
        console.log("Search failed:", error);
      }
    });
  }

  openFeedbackModal(templateRef: TemplateRef<any>, record: any, feedbackType: string) {
    const modalRef = this.modalService.open(templateRef, { keyboard: false, centered: true, scrollable: true, fullscreen: false, animation: true, backdrop: 'static', size: 'md', role: 'alertdialog', });
    modalRef.result.then(
        (result: any) => { console.log(result); },
        (reason: any) => { console.log(reason); },
      )
      .catch((reason: any) => { console.log(reason); });
  }

  feedbackSubmit(form: NgForm, activeModal: NgbActiveModal) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    console.log(form.value, activeModal);
    activeModal.close('success');
  }
}

export const data = [
    {
      sNo: 1,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Success',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 2,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 3,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 4,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Success',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 5,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 6,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 7,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 8,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 9,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 10,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 11,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 12,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 13,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 14,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 15,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 16,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 17,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 18,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 19,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 20,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 21,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 22,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 23,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 24,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 25,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 26,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 27,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 28,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 29,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 30,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 31,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 32,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 33,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 34,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 35,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 36,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 37,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 38,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
    {
      sNo: 39,
      zone: 'Central',
      div: 'Mumbai',
      stn: 'CSMT',
      alert: 'Failure',
      assetType: 'Point Machine',
      assetNo: 'PM-101',
      incTime: '2026-05-01 10:00',
      rectTime: '2026-05-01 12:00',
      duration: '2h',
      cause: 'Voltage Drop',
      feedback: 'T',
    },
    {
      sNo: 40,
      zone: 'Western',
      div: 'Ratlam',
      stn: 'Ujjain',
      alert: 'Predictive',
      assetType: 'Track Ckt',
      assetNo: 'TC-502',
      incTime: '2026-05-02 08:30',
      rectTime: null,
      duration: null,
      cause: null,
      feedback: 'M',
    },
  ];

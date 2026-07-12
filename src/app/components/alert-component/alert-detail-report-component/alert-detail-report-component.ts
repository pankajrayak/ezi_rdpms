import { DatePipe } from '@angular/common';
import { Component, inject, AfterViewInit, computed, debounced, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { apply, disabled, form, FormField, FormRoot, required, schema, submit } from '@angular/forms/signals';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';
import { NgxPrintDirective } from 'ngx-print';
import { firstValueFrom, of } from 'rxjs';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
  alertType: string;
  assetType: string;
  assetNumber: string;
  alertFeedback: string;
  cause: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
}

@Component({
  selector: 'alert-detail-report-component',
  imports: [DatePipe, FormField, FormRoot, NgxPrintDirective, PageHeaderComponent],
  templateUrl: './alert-detail-report-component.html',
  styleUrl: './alert-detail-report-component.scss',
})
export class AlertDetailReportComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    setTimeout(() => { this.f().reset(); }, 100);
  }

  private dataService = inject(DataService);

  readonly formModel: SearchFormModel = {
    zone: '',
    division: '',
    station: '',
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

  readonly records = signal(<any>[]);
  readonly model = signal(this.formModel);

  readonly formSchema = schema<SearchFormModel>((fieldPath) => {
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

  readonly f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, { when: () => this.f().submitting() });
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
  });
  
  zonesRes = rxResource({ stream: () => this.dataService.getZones() ?? of([]) });
  alertTypesRes = rxResource({ stream: () => this.dataService.getAlertTypes() ?? of([]) });
  assetTypesRes = rxResource({ stream: () => this.dataService.getAssetTypes() ?? of([]) });
  assetNumbersRes = rxResource({ stream: () => of(['001', '002', '003', '004']) });
  alertFeedbacksRes = rxResource({ stream: () => of(['T', 'F', 'M']) });
  causesRes = rxResource({ stream: () => of(['PT-OBS']) });
  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) });
  
  debouncedZone = debounced(computed(() => this.model().zone), 500);
  divisionsRes = rxResource({
    params: () => {
      const z = this.debouncedZone.value();
      return z && z.trim() !== '' ? z : undefined; 
    },
    stream: ({ params: z }) => (z ? this.dataService.getDivisions(z) : of([])),
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
        this.records.set(this.data);
      } catch (error) {
        console.log("Search failed:", error);
      }
    });
  }
  
  data = [
    {
      sNo: 1,
      zone: 'Central',
      division: 'Mumbai',
      station: 'CSTM',
      alertType: 'Failure',
      assetType: 'Point Machine',
      assetNumber: 'PM-202A',
      cause: 'PT-OBS',
      alertFeedback: 'T',
      incDateTime: '2026-04-19 10:00 AM',
      duration: '02:45:00',
      feedbackDateTime: '2026-04-19 12:45 PM',
      maintainerName: 'Rahul Sharma',
      maintainerDesignation: 'Sr. Technician',
      maintainerMobile: '9876543210',
      maintainerRemark: 'Loose connection tightened at junction box.',
    },
    {
      sNo: 2,
      zone: 'Western',
      division: 'Ratlam',
      station: 'Ujjain Jn',
      alertType: 'Predictive',
      assetType: 'Track Ckt',
      assetNumber: 'TC-501',
      cause: 'Voltage Drop',
      alertFeedback: 'M',
      incDateTime: '2026-04-19 08:15 AM',
      duration: '01:20:00',
      feedbackDateTime: '2026-04-19 09:35 AM',
      maintainerName: 'Amit Verma',
      maintainerDesignation: 'JE S&T',
      maintainerMobile: '9123456789',
      maintainerRemark: 'Battery bank checked, charging stabilized.',
    },
    {
      sNo: 3,
      zone: 'Central',
      division: 'Nagpur',
      station: 'Ajni',
      alertType: 'Failure',
      assetType: 'Point Machine',
      assetNumber: 'PM-114',
      cause: 'PT-OBS',
      alertFeedback: 'F',
      incDateTime: '2026-04-18 11:45 PM',
      duration: '04:10:00',
      feedbackDateTime: '2026-04-19 03:55 AM',
      maintainerName: 'Suresh Raina',
      maintainerDesignation: 'Technician-I',
      maintainerMobile: '9988776655',
      maintainerRemark: 'Foreign object removed from point blade.',
    },
    {
      sNo: 4,
      zone: 'Western',
      division: 'Ahmedabad',
      station: 'Sabarmati',
      alertType: 'Predictive',
      assetType: 'Axle Counter',
      assetNumber: 'AC-309',
      cause: 'Communication Error',
      alertFeedback: 'T',
      incDateTime: '2026-04-18 02:20 PM',
      duration: '00:55:00',
      feedbackDateTime: '2026-04-18 03:15 PM',
      maintainerName: 'Deepak Jha',
      maintainerDesignation: 'ESM',
      maintainerMobile: '8877665544',
      maintainerRemark: 'Reset done, card working normally.',
    },
    {
      sNo: 5,
      zone: 'Central',
      division: 'Pune',
      station: 'Lonavala',
      alertType: 'Failure',
      assetType: 'Signal Main',
      assetNumber: 'SIG-L12',
      cause: 'Fuse Blown',
      alertFeedback: 'M',
      incDateTime: '2026-04-17 05:10 AM',
      duration: '01:05:00',
      feedbackDateTime: '2026-04-17 06:15 AM',
      maintainerName: 'Karan Singh',
      maintainerDesignation: 'Helper',
      maintainerMobile: '7766554433',
      maintainerRemark: 'Fuse replaced, signal aspect restored.',
    },
  ];
}

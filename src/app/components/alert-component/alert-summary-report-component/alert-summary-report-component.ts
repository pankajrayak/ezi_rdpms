import { DatePipe } from '@angular/common';
import { Component, inject, AfterViewInit, signal, computed, debounced } from '@angular/core';
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
  cause: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  view: string;
}

@Component({
  selector: 'alert-summary-report-component',
  imports: [DatePipe, FormField, FormRoot, PageHeaderComponent, NgxPrintDirective],
  templateUrl: './alert-summary-report-component.html',
  styleUrl: './alert-summary-report-component.scss',
})
export class AlertSummaryReportComponent implements AfterViewInit {

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
    cause: 'All',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    view: 'Table',
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
    required(fieldPath.cause, { message: 'required field' });
    required(fieldPath.fromDate, { message: 'required field' });
    required(fieldPath.fromTime, { message: 'required field' });
    required(fieldPath.view, { message: 'required field' });
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
        this.records.set(response.data);
      } catch (error) {
        console.log("Search failed:", error);
      }
    });
  }
}

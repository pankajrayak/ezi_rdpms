import { Component, inject, ChangeDetectionStrategy, computed, debounced, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { apply, disabled, form, FormField, FormRoot, required, schema, submit } from '@angular/forms/signals';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';
import { firstValueFrom, of } from 'rxjs';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
  assetType: string;
  assetNumber: string;
  view: string;
}

@Component({
  selector: 'telemetry-live-component',
  imports: [FormField, FormRoot, PageHeaderComponent],
  templateUrl: './telemetry-live-component.html',
  styleUrl: './telemetry-live-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TelemetryLiveComponent {
  private dataService = inject(DataService);

  readonly formModel: SearchFormModel = {
    zone: '',
    division: '',
    station: '',
    assetType: '',
    assetNumber: '',
    view: 'Table',
  }

  readonly records = signal(<any>[]);
  readonly model = signal(this.formModel);

  readonly formSchema = schema<SearchFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
    required(fieldPath.assetNumber, { message: 'required field' });
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
  assetTypesRes = rxResource({ stream: () => this.dataService.getAssetTypes() ?? of([]) });
  assetNumbersRes = rxResource({ stream: () => of(['001', '002', '003', '004']) });
  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) });
  
  debouncedZone = debounced(computed(() => this.model().zone), 500);
  divisionsRes = rxResource({
    params: () =>  this.debouncedZone.value(),
    stream: ({ params: z }) => (z ? this.dataService.getDivisions(z) : of([])),
  });

  debouncedDivision = debounced(computed(() => this.model().division), 500);
  stationsRes = rxResource({
    params: () => this.debouncedDivision.value(),
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

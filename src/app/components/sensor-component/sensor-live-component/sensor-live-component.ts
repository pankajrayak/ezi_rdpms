import { Component, inject, signal, computed, debounced } from '@angular/core';
import { schema, required, form, apply, disabled, submit, FormField, FormRoot } from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';
import { firstValueFrom, of } from 'rxjs';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
  assetType: string;
  view: string;
}

@Component({
  selector: 'sensor-live-component',
  imports: [FormField, FormRoot, PageHeaderComponent],
  templateUrl: './sensor-live-component.html',
  styleUrl: './sensor-live-component.scss',
})
export class SensorLiveComponent {
  private dataService = inject(DataService);

  readonly formModel: SearchFormModel = {
    zone: '',
    division: '',
    station: '',
    assetType: '',
    view: 'Table',
  }

  readonly records = signal(<any>[]);
  readonly model = signal(this.formModel);

  readonly formSchema = schema<SearchFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
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

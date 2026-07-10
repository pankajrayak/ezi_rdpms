import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, signal, computed, debounced, effect } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { HasUnsavedChanges } from '@rdpms/core/interfaces';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService, GlobalUtility } from '@rdpms/shared/utility';
import { apply, disabled, form, FormField, FormRoot, required, schema } from '@angular/forms/signals';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
}

interface Asset {
  name: string;
  healthy: number;
  predictive: number;
  failure: number;
}

@Component({
  selector: 'home-component',
  imports: [CommonModule, FormField, FormRoot, PageHeaderComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HomeComponent implements HasUnsavedChanges {
  private dataService = inject(DataService);
  public globalUtility = inject(GlobalUtility);
  
  readonly formModel: SearchFormModel = { zone: '', division: '', station: '' }
  readonly model = signal(this.formModel);

  readonly formSchema = schema<SearchFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
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
  }, {
    submission: {
      action: async (formInstance) => {
        const payload = formInstance().value();
        try {
          const response = await firstValueFrom(this.dataService.searchData(payload));
          console.log('Search complete:', response);
        } catch (error) {
          console.log("Search failed:", error);
        }
      },
    }
  });

  zonesRes = this.dataService.getZonesResource();

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

  // Dummy Data for the 7 specific assets requested
  assets = signal<Asset[]>([
    { name: 'DC Track Circuit', healthy: 85, predictive: 10, failure: 5 },
    { name: 'Main Signal', healthy: 92, predictive: 5, failure: 3 },
    { name: 'Axle Counter', healthy: 78, predictive: 12, failure: 10 },
    { name: 'LC Gate', healthy: 60, predictive: 25, failure: 15 },
    { name: 'Point Machine', healthy: 88, predictive: 8, failure: 4 },
    { name: 'Sensor/IOT', healthy: 98, predictive: 2, failure: 0 },
    { name: 'Total Assets', healthy: 403, predictive: 60, failure: 37 },
  ]);

  private readonly layoutCounts = computed(() =>  {
    const n: number = this.assets().length;
    
    if (n === 0) return { topCount: 0, remaining: 0 };

    let topCount = Math.max(4, Math.floor(n / 2) + 1);
    if (topCount > n) { topCount = n; }

    let remaining = n - topCount;
    if (remaining === 1 && topCount > 1) {
      topCount -= 1;
      remaining += 1;
    }
    return { topCount, remaining}
  });

  readonly topCards = computed(() => {
    const { topCount } = this.layoutCounts();
    return this.assets().slice(0, topCount); 
  });

  readonly sideCards = computed(() => {
    const { topCount } = this.layoutCounts();
    return this.assets().slice(topCount);
  });

  hasUnsavedChanges(): boolean { return false; }

}

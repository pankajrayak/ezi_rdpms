import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, signal, computed, debounced } from '@angular/core';
import { schema, required, form, apply, disabled, FormField, FormRoot } from '@angular/forms/signals';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { rxResource } from '@angular/core/rxjs-interop';
import { DataService } from '@rdpms/shared/utility';
import { NgxPrintDirective } from 'ngx-print';
import { firstValueFrom, of } from 'rxjs';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
  assetType: string;
  assetMake: string;
  view: string;
}

@Component({
  selector: 'asset-detail-report-component',
  imports: [CommonModule, FormField, FormRoot, PageHeaderComponent, NgbPaginationModule, NgxPrintDirective],
  templateUrl: './asset-detail-report-component.html',
  styleUrl: './asset-detail-report-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AssetDetailReportComponent {
  private dataService = inject(DataService);
  
  readonly formModel: SearchFormModel = {
    zone: '',
    division: '',
    station: '',
    assetMake: '',
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
    required(fieldPath.assetMake, { message: 'required field' });
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
  }, {
    submission: {
      action: async (formInstance) => {
        const payload = formInstance().value();
        try {
          const response = await firstValueFrom(this.dataService.getPagedRecord(1, 10, { station: 'CSMT' }));
          console.log('Search complete:', response);
          this.records.set(response.data);
        } catch (error) {
          console.log("Search failed:", error);
        }
      },
    }
  });

  zonesRes = rxResource({ stream: () => this.dataService.getZones() ?? of([]) });
  assetTypesRes = rxResource({ stream: () => this.dataService.getAssetTypes() ?? of([]) });
  assetMakesRes = rxResource({ stream: () => of(['001', '002', '003', '004']) });
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

}

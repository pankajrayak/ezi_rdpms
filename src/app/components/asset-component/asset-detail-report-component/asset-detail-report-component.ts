import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, debounced, effect } from '@angular/core';
import { schema, required, form, apply, disabled, FormField, FormRoot } from '@angular/forms/signals';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { rxResource } from '@angular/core/rxjs-interop';
import { DataService, GlobalUtility } from '@rdpms/shared/utility';
import { NgxPrintDirective } from 'ngx-print';
import { firstValueFrom, of } from 'rxjs';
import { ToastService } from '@rdpms/core/services';
import { InputService } from '../../../services/input-service';

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
})
export class AssetDetailReportComponent {

  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private inputService = inject(InputService);
  private globalUtility = inject(GlobalUtility);
    
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

  debouncedZone = debounced(computed(() => this.model().zone), 500);
  debouncedDivision = debounced(computed(() => this.model().division), 500);
  
  zonesRes = this.inputService.getZoneListResource();
  assetTypesRes = this.inputService.getAssetTypeListResource();
  divisionsRes = this.inputService.getDivisionListResource(this.debouncedZone.value);
  stationsRes = this.inputService.getStationListResource(this.debouncedZone.value, this.debouncedDivision.value);

  assetMakesRes = rxResource({ stream: () => of(['PT-01', 'PT-02', 'PT-03', 'PT-04']) });
  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) });
  
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

  constructor() {
    const toastOptions = { classname: 'bg-danger text-white', delay: 5000 };
    effect(() => {
      const zoneError = this.zonesRes.error();
      if(zoneError) { this.toastService.show(this.globalUtility.getErrorMessage(zoneError), toastOptions); }

      const divisionError = this.divisionsRes.error();
      if(divisionError) { this.toastService.show(this.globalUtility.getErrorMessage(divisionError), toastOptions); }

      const stationError = this.stationsRes.error();
      if(stationError) { this.toastService.show(this.globalUtility.getErrorMessage(stationError), toastOptions); }

      const assetTypeError = this.assetTypesRes.error();
      if(assetTypeError) { this.toastService.show(this.globalUtility.getErrorMessage(assetTypeError), toastOptions); }
    });
  }

  onZoneChange() {
    this.f.division().reset();
    this.f.station().reset();
    // this.model.update((m) => ({ ...m, division: '', station: '' }));
  }

  onDivisionChange() {
    this.f.station().reset();
    // this.model.update((m) => ({ ...m, station: '' }));
  }

}

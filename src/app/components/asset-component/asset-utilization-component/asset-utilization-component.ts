import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, debounced, AfterViewInit } from '@angular/core';
import { finalize, of } from 'rxjs';
import { apply, disabled, FieldTree, form, FormField, required, schema, validateTree } from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService, GlobalUtility } from '@rdpms/shared/utility';
import { ToastService } from '@rdpms/core/services';
import { InputService } from '../../../services/input-service';

interface SensorFormModel {
  zone: string;
  division: string;
  station: string;
  assetType: string;
  assetNumber: string;
  fromDate: string | null;
  toDate: string | null;
  view: string;
}

@Component({
  selector: 'asset-utilization-component',
  imports: [CommonModule, FormField, PageHeaderComponent],
  templateUrl: './asset-utilization-component.html',
  styleUrl: './asset-utilization-component.scss',
})
export class AssetUtilizationComponent implements AfterViewInit {

  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private inputService = inject(InputService);
  public globalUtility = inject(GlobalUtility);

  readonly formModel: SensorFormModel = {
    zone: '',
    division: '',
    station: '',
    assetType: 'All',
    assetNumber: '',
    fromDate: '',
    toDate: '',
    view: 'Table',
  };

  readonly records = signal(<any>[]);
  readonly isSubmitting = signal(false);
  readonly model = signal(this.formModel);

  debouncedZone = debounced(computed(() => this.model().zone), 500);
  debouncedDivision = debounced(computed(() => this.model().division), 500);
  
  zonesRes = this.inputService.getZoneListResource();
  assetTypesRes = this.inputService.getAssetTypeListResource();
  divisionsRes = this.inputService.getDivisionListResource(this.debouncedZone.value);
  stationsRes = this.inputService.getStationListResource(this.debouncedZone.value, this.debouncedDivision.value);

  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) });
  assetNumbersRes = rxResource({ stream: () => of(['PT-01', 'PT-02', 'PT-03', 'PT-04']) });
  
  readonly formSchema = schema<SensorFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
    required(fieldPath.assetNumber, { message: 'required field' });
    required(fieldPath.fromDate, { message: 'required field' });
    required(fieldPath.view, { message: 'required field' });
  });

  readonly f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, { 
      when: () => this.isSubmitting() 
    });
    disabled(s.zone, {
      when: (ctx) => {
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
      const { fromDate, toDate } = ctx.valueOf(s);
      
      if(fromDate && toDate && toDate < fromDate){
        return { kind: 'dateBeforeFrom', message: `Date must be on or after ${fromDate}`, fieldTree: ctx.fieldTree.toDate }
      }
      return null;
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

      const assetTypeError = this.assetTypesRes.error();
      if(assetTypeError) { this.toastService.show(this.globalUtility.getErrorMessage(assetTypeError), toastOptions); }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.f().reset(); }, 100);
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

 onDateTimeChanged(event: Event, formCtrl: FieldTree<string | null>){
    const input = event.target as HTMLInputElement;
    if(!input.value) {
      formCtrl().value.set('');
      input.blur(); input.focus();
    }
  }

  onSubmit() {
    if (this.f().invalid()) {
      this.f().markAsTouched();
      return;
    }

    console.log(this.f().value(), this.model());
    // this.isSubmitting.set(true);
    // this.dataService.searchData(this.model())
    //   .pipe(finalize(() => { this.isSubmitting.set(false); }))
    //   .subscribe({
    //     next: (res) => console.log('Search complete', res),
    //     error: (err) => { this.resetForm(); },
    //   });
  }

  resetForm() {
    // this.model.set(this.formModel);
    this.f().reset(this.formModel);
  }

  updateRecord(id: number) {
    this.records.update((records) => {
      records.map((item: any) => (item.id === id ? { ...item, active: !item.active } : item));
    });
  }
}


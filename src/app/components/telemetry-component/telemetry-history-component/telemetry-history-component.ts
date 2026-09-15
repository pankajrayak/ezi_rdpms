import { Component, inject, AfterViewInit, computed, debounced, signal, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { schema, required, form, apply, disabled, submit, FormField, FormRoot, validateTree, FieldTree } from '@angular/forms/signals';
import { ToastService } from '@rdpms/core/services';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService, GlobalUtility } from '@rdpms/shared/utility';
import { firstValueFrom, of } from 'rxjs';
import { InputService } from '../../../services/input-service';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
  assetType: string;
  assetNumber: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  view: string;
}

@Component({
  selector: 'telemetry-history-component',
  imports: [FormField, FormRoot, PageHeaderComponent],
  templateUrl: './telemetry-history-component.html',
  styleUrl: './telemetry-history-component.scss',
})
export class TelemetryHistoryComponent implements AfterViewInit {

  private dataService = inject(DataService);
  public toastService = inject(ToastService);
  private inputService = inject(InputService);
  public globalUtility = inject(GlobalUtility);

  readonly formModel: SearchFormModel = {
    zone: '',
    division: '',
    station: '',
    assetType: '',
    assetNumber: '',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
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

  assetNumbersRes = rxResource({ stream: () => of(['PT-01', 'PT-02', 'PT-03', 'PT-04']) });
  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) });
  
  readonly formSchema = schema<SearchFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
    required(fieldPath.assetNumber, { message: 'required field' });
    required(fieldPath.fromDate, { message: 'required field' });
    required(fieldPath.fromTime, { message: 'required field' });
    required(fieldPath.view, { message: 'required field' });
  });

  readonly f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, { 
      when: () => this.f().submitting()
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

  timeTOMinutes(timeStr: string): number {
    if(!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
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

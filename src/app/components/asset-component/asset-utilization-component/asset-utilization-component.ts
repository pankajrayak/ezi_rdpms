import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, debounced, AfterViewInit } from '@angular/core';
import { finalize, of } from 'rxjs';
import { apply, applyWhen, disabled, form, FormField, required, schema, SchemaPath, validate } from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService, GlobalUtility } from '@rdpms/shared/utility';

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

  ngAfterViewInit(): void {
    setTimeout(() => { this.f().reset(); }, 100);
  }

  private dataService = inject(DataService);
  public globalUtility = inject(GlobalUtility);

  readonly formModel: SensorFormModel = {
    zone: '',
    division: '',
    station: '',
    assetType: 'All',
    assetNumber: '',
    fromDate: null,
    toDate: null,
    view: 'Table',
  };

  readonly records = signal(<any>[]);
  readonly isSubmitting = signal(false);
  readonly model = signal(this.formModel);

  readonly formSchema = schema<SensorFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
    required(fieldPath.assetNumber, { message: 'required field' });
    required(fieldPath.fromDate, { message: 'required field' });
    required(fieldPath.view, { message: 'required field' });
    // required(fieldPath.toDate, { message: 'required field', when: (ctx) => !!ctx.valueOf(fieldPath.fromDate) });
  });

  readonly f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, { when: () => this.isSubmitting() });
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

    // applyWhen(s.toDate, () => !!this.model().fromDate,
    //   schema((ss) => { required(ss, { message: 'required field' }); })
    // );

    // validate(s.fromDate, (ctx) => {
    //   const fromVal = ctx.value(), toVal = ctx.valueOf(s.toDate);
    //   return new Date(fromVal)?.getTime() > new Date(toVal)?.getTime()
    //     ? { kind: 'maxDate', message: `date can not be more than ${toVal}` }
    //     : null;
    // });

    // validate(s.toDate, (ctx) => {
    //   const toVal = ctx.value(), fromVal = ctx.valueOf(s.fromDate);
    //   return new Date(toVal)?.getTime() < new Date(fromVal)?.getTime()
    //     ? { kind: 'minDate', message: `date can not be less than ${fromVal}` }
    //     : null;
    // });

    // validate(s.fromDate, this.maxDateValidation(s.toDate));
    // validate(s.toDate, this.minDateValidation(s.fromDate));
  });

  minDateValidation(minValuePath: SchemaPath<string>) {
    return (ctx: any) => {
      const maxVal = ctx.value(), minVal = ctx.valueOf(minValuePath);

      if (!minVal || !maxVal) return null;

      return new Date(maxVal).getTime() < new Date(minVal).getTime()
        ? { kind: 'minDate', message: 'to date cannot be earlier than start date' }
        : null;
    };
  }

  maxDateValidation(maxValuePath: SchemaPath<string>) {
    return (ctx: any) => {
      const minVal = ctx.value(), maxVal = ctx.valueOf(maxValuePath);

      if (!minVal || !maxVal) return null;

      return new Date(minVal).getTime() > new Date(maxVal).getTime()
        ? { kind: 'maxDate', message: 'from date cannot be later than end date' }
        : null;
    };
  }

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

  stationEffect = effect(() => {
    const error = this.stationsRes.error();
    if (error) { console.error('station not found', error); }
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

  onDateTimeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.value) {
      input.value = '';
      input.blur();
      input.focus();
    }
  }

  onSubmit() {
    if (this.f().invalid()) {
      this.f().markAsTouched();
      return;
    }

    console.log(this.f().value(), this.model());
    this.isSubmitting.set(true);
    this.dataService.searchData(this.model())
      .pipe(finalize(() => { this.isSubmitting.set(false); }))
      .subscribe({
        next: (res) => console.log('Search complete', res),
        error: (err) => { this.resetForm(); },
      });
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


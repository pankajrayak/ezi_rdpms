import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { finalize, of } from 'rxjs';
import { apply, applyWhen, disabled, form, FormField, required, schema, SchemaPath, validate } from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService, debounceResource, GlobalUtility } from '@rdpms/shared/utility';

interface SensorFormModel {
  zone: string;
  division: string;
  station: string;
  assetType: string;
  assetNumber: string;
  fromDate: string;
  toDate: string;
  view: string;
}

@Component({
  selector: 'app-asset-utilization-component',
  imports: [CommonModule, FormField, PageHeaderComponent],
  templateUrl: './asset-utilization-component.html',
  styleUrl: './asset-utilization-component.scss',
})
export class AssetUtilizationComponent {
  private dataService = inject(DataService);
  public globalUtility = inject(GlobalUtility);

  formModel: SensorFormModel = {
    zone: '',
    division: '',
    station: '',
    assetType: 'All',
    assetNumber: '',
    fromDate: '',
    toDate: '',
    view: 'Table',
  };

  records = signal(<any>[]);
  isSubmitting = signal(false);
  model = signal(this.formModel);

  formSchema = schema<SensorFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
    required(fieldPath.assetType, { message: 'required field' });
    required(fieldPath.assetNumber, { message: 'required field' });
    required(fieldPath.fromDate, { message: 'required field' });
    required(fieldPath.view, { message: 'required field' });
    // required(fieldPath.toDate, { message: 'required field', when: (ctx) => !!ctx.valueOf(fieldPath.fromDate) });
  });

  f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, () => this.isSubmitting());
    disabled(s.division, (ctx) => !ctx.valueOf(s.zone) || this.divisionsRes.isLoading());
    disabled(s.station, (ctx) => !ctx.valueOf(s.division) || this.stationsRes.isLoading());

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
      return maxVal && minVal && new Date(maxVal).getTime() < new Date(minVal).getTime()
        ? { kind: 'minDate' }
        : null;
    };
  }

  maxDateValidation(maxValuePath: SchemaPath<string>) {
    return (ctx: any) => {
      const minVal = ctx.value(), maxVal = ctx.valueOf(maxValuePath);
      return minVal && maxVal && new Date(minVal).getTime() > new Date(maxVal).getTime()
        ? { kind: 'maxDate' }
        : null;
    };
  }

  zonesRes = rxResource({ stream: () => this.dataService.getZones() ?? of([]) });
  assetTypesRes = rxResource({ stream: () => this.dataService.getAssetTypes() ?? of([]) });
  assetNumbersRes = rxResource({ stream: () => of(['001', '002', '003', '004']) });
  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) });

  divisionsRes = rxResource({
    params: () => this.model().zone,
    stream: ({ params: z }) => (z ? this.dataService.getDivisions(z) : of([])),
  });

  stationsRes = rxResource({
    params: () => this.model().division,
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
      this.markAllTouched();
      return;
    }

    console.log(this.f().value(), this.model());
    this.isSubmitting.set(true);
    this.dataService.searchData(this.model())
      .pipe( finalize(() => { this.isSubmitting.set(false); }), )
      .subscribe({
        next: (res) => console.log('Search complete', res),
        error: (err) => { this.resetForm(); },
      });
  }

  markAllTouched() {
    this.f.zone().markAsTouched();
    this.f.division().markAsTouched();
    this.f.station().markAsTouched();
    this.f.assetType().markAsTouched();
    this.f.assetNumber().markAsTouched();
    this.f.fromDate().markAsTouched();
    this.f.toDate().markAsTouched();
    this.f.view().markAsTouched();
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

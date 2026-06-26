import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { finalize, of } from 'rxjs';
import { apply, disabled, form, FormField, required, schema, SchemaPath, validate } from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService, GlobalUtil } from '@rdpms/shared/utility';

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
  public globalUtility = inject(GlobalUtil);

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

  model = signal(this.formModel);

  formSchema = schema<SensorFormModel>((schemaPath) => {
    required(schemaPath.zone, { message: 'required field' });
    required(schemaPath.division, { message: 'required field' });
    required(schemaPath.station, { message: 'required field' });
    required(schemaPath.assetType, { message: 'required field' });
    required(schemaPath.assetNumber, { message: 'required field' });
    required(schemaPath.fromDate, { message: 'required field' });
    required(schemaPath.view, { message: 'required field' });
    // required(schemaPath.toDate, { message: 'required field', when: () => !!this.model().fromDate });
  });

  f = form(this.model, (schemaPath) => {
    apply(schemaPath, this.formSchema);
    disabled(schemaPath, () => this.isSubmitting());
    disabled(schemaPath.division, () => !this.model().zone || this.divisionsRes.isLoading());
    disabled(schemaPath.station, ({ valueOf }) => !valueOf(schemaPath.division) || this.stationsRes.isLoading());

    // applyWhen(s.toDate, () => !!this.model().fromDate,
    //   schema((ss) => { required(ss, { message: 'required field' }); })
    // );

    // validate(schemaPath.fromDate, () => {
    //   const state = this.model();
    //   return new Date(state.fromDate)?.getTime() > new Date(state.toDate)?.getTime()
    //     ? { kind: 'maxDate', message: `date can not be more than ${state.toDate}` }
    //     : null;
    // });

    // validate(schemaPath.toDate, () => {
    //   const state = this.model();
    //   return new Date(state.toDate)?.getTime() < new Date(state.fromDate)?.getTime()
    //     ? { kind: 'minDate', message: `date can not be less than ${state.fromDate}` }
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

  isSubmitting = signal(false);
  records = signal(<any>[]);

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

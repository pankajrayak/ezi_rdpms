import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, debounced, effect, OnDestroy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HasUnsavedChanges } from '@rdpms/core/interfaces';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { GlobalUtility } from '@rdpms/shared/utility';
import { apply, disabled, form, FormField, FormRoot, required, schema } from '@angular/forms/signals';
import { InputService } from '../../services/input-service';
import { ToastService } from '@rdpms/core/services';
import { Router } from '@angular/router';

interface SearchFormModel {
  zone: string;
  division: string;
  station: string;
}

interface Status {
  status: string;
  alertTypeId: string;
  sequenceNo: string;
  count: number;
}

interface Asset {
  assetTypeId: string;
  assetType: string;
  statusList: Status[];
}

@Component({
  selector: 'home-component',
  imports: [CommonModule, FormField, FormRoot, PageHeaderComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent implements OnDestroy, HasUnsavedChanges {

  private router = inject(Router);
  public toastService = inject(ToastService);
  public globalUtility = inject(GlobalUtility);
  private inputService = inject(InputService);
  
  readonly formModel: SearchFormModel = { zone: 'All', division: 'All', station: 'All' }
  readonly model = signal(this.formModel);
  public assets = signal<Asset[] | null>(null);
  private intervalId = signal<number | null>(null);

  debouncedZone = debounced(computed(() => this.model().zone), 500);
  debouncedDivision = debounced(computed(() => this.model().division), 500);
  
  zonesRes = this.inputService.getZoneListResource();
  divisionsRes = this.inputService.getDivisionListResource(this.debouncedZone.value);
  stationsRes = this.inputService.getStationListResource(this.debouncedZone.value, this.debouncedDivision.value);

  readonly formSchema = schema<SearchFormModel>((fieldPath) => {
    required(fieldPath.zone, { message: 'required field' });
    required(fieldPath.division, { message: 'required field' });
    required(fieldPath.station, { message: 'required field' });
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
        this.resetAssets();
        const formValue = formInstance().value();
        await this.getDashboardStatusCount(formValue);
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
    });
  }

  ngOnInit(): void {
    this.getDashboardStatusCount(this.f().value());
    this.reloadStatusCount();
  }

  reloadStatusCount(){
    const id = setInterval(() => {
      this.getDashboardStatusCount(this.f().value());
    }, 5 * 1000);
    this.intervalId.set(id);
  }

  resetAssets() {
    // this.assets.set([]);
  }

  onZoneChange() {
    this.resetAssets();
    this.f.station().reset();
    this.f.division().reset();
    this.model.update((m) => ({ ...m, division: 'All', station: 'All' }));
  }

  onDivisionChange() {
    this.resetAssets();
    this.f.station().reset();
    this.model.update((m) => ({ ...m, station: 'All' }));
  }

  onStationChanged() {
    this.resetAssets();
  }

  async getDashboardStatusCount(payload: Partial<SearchFormModel>) {
    try {
      // this.records.set(null);
      const response = await firstValueFrom(this.inputService.getDashboardStatusCount(payload));
      this.assets.set(response ?? []);
    } catch (error: any) {
      this.assets.set([]);
      this.toastService.show(
        this.globalUtility.getErrorMessage(error),
        { classname: 'bg-danger text-white', delay: 10000, showProgress: true }
      );
    }
  }

  private readonly layoutCounts = computed(() =>  {
    const n: number = this.assets()?.length ?? 0;
    
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
    return this.assets()?.slice(0, topCount); 
  });

  readonly sideCards = computed(() => {
    const { topCount } = this.layoutCounts();
    return this.assets()?.slice(topCount);
  });

  routeToAlertLive(asset: any, status: any){

    const formValue = this.f().value();
    const data = {...formValue, assetType: asset.assetType, alertType: status };
    console.log(asset);
    sessionStorage.setItem("alertRouteData", JSON.stringify(data));
    this.router.navigate(['/user/alert/live']);
  }

  hasUnsavedChanges(): boolean { return false; }

  ngOnDestroy(): void {
    const id = this.intervalId()
    if(id) { clearInterval(id); }
  }

}

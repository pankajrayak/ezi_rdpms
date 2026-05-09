import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Route {
  id: string;
  path: number[][];
  active: boolean;
}

export interface Signal {
  id: string;
  x: number;
  y: number;
  aspect: 'RED' | 'GREEN';
  routeId: string;
}

export interface Point {
  id: string;
  x: number;
  y: number;
  state: 'STRAIGHT' | 'DIVERGING';
}

export interface Train {
  id: string;
  routeId: string;
  progress: number;
  speed: number;
}

@Injectable({ providedIn: 'root' })
export class SipService {

  private stateSubject = new BehaviorSubject<any>({
    
    // 🛤️ MULTI TRACK ROUTES
    routes: [
      {
        id: 'R1',
        path: [[50,150],[300,150],[550,150]],
        active: true
      },
      {
        id: 'R2',
        path: [[300,150],[450,80],[700,80]],
        active: false
      },
      {
        id: 'R3',
        path: [[300,150],[450,220],[700,220]],
        active: false
      }
    ],

    // 🚦 SIGNALS
    signals: [
      { id: 'S1', x: 300, y: 150, aspect: 'GREEN', routeId: 'R1' },
      { id: 'S2', x: 700, y: 80, aspect: 'RED', routeId: 'R2' },
      { id: 'S3', x: 700, y: 220, aspect: 'RED', routeId: 'R3' }
    ],

    // 🔀 POINT (TRACK CHANGE)
    points: [
      { id: 'P1', x: 300, y: 150, state: 'STRAIGHT' }
    ],

    // 🚄 TRAIN
    trains: [
      {
        id: 'T1',
        routeId: 'R1',
        progress: 0,
        speed: 0.003
      }
    ]
  });

  state$ = this.stateSubject.asObservable();

  get state() {
    return this.stateSubject.value;
  }

  /** 🚄 START SIMULATION */
  start() {
    const loop = () => {
      const state = this.state;

      // move train
      state.trains.forEach((t: Train) => {
        t.progress += t.speed;
        if (t.progress > 1) t.progress = 0;
      });

      this.updateSignals(state);

      this.stateSubject.next({ ...state });

      requestAnimationFrame(loop);
    };

    loop();
  }

  /** 🚦 SIGNAL LOGIC */
  updateSignals(state: any) {
    state.signals.forEach((s: Signal) => {
      const route = state.routes.find((r: Route) => r.id === s.routeId);

      s.aspect = route?.active ? 'GREEN' : 'RED';
    });
  }

  /** 🔀 SWITCH TRACK */
  togglePoint() {
    const state = this.state;

    const point = state.points[0];

    // toggle point
    point.state = point.state === 'STRAIGHT' ? 'DIVERGING' : 'STRAIGHT';

    // deactivate all routes
    state.routes.forEach((r: Route) => r.active = false);

    // activate route based on point
    if (point.state === 'STRAIGHT') {
      state.routes.find((r: Route) => r.id === 'R1').active = true;
      state.trains[0].routeId = 'R1';
    } else {
      state.routes.find((r: Route) => r.id === 'R2').active = true;
      state.trains[0].routeId = 'R2';
    }

    this.stateSubject.next({ ...state });
  }

  /** 🚄 TRAIN POSITION */
  getPosition(route: number[][], progress: number) {
    const i = Math.floor(progress * (route.length - 1));
    const j = Math.min(i + 1, route.length - 1);

    const t = (progress * (route.length - 1)) - i;

    return {
      x: route[i][0] + (route[j][0] - route[i][0]) * t,
      y: route[i][1] + (route[j][1] - route[i][1]) * t
    };
  }
}
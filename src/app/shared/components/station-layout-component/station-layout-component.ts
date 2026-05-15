import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, NgZone, OnDestroy, OnInit, signal } from "@angular/core";

export interface TrackSegment {
  id: string;
  type: 'main' | 'loop';
  direction: 'up' | 'down';
  platformNumber?: number;
  y: number;
}

export interface Signal {
  id: string;
  trackId: string;
  x: number;
  state: 'RED' | 'YELLOW' | 'GREEN';
}

export interface Train {
  id: string;
  name: string;
  direction: 'up' | 'down';
  currentTrackId: string;
  targetTrackId: string;
  x: number;
  length: number;
  speed: number;
  maxSpeed: number;
  isNonStop: boolean;
  stopCounter: number;
  hasStoppedAtPlatform: boolean;
  isWaitingAtPlatform: boolean;
  color: string;
  status: 'RUNNING' | 'BRAKING' | 'STOPPED' | 'ACCELERATING' | 'EXITED';
}

export function getBezierY(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return (mt * mt * mt * p0) + (3 * mt * mt * t * p1) + (3 * mt * t * t * p2) + (t * t * t * p3);
}

@Injectable({
  providedIn: 'root'
})
export class RailwaySimulationService {
  readonly canvasWidth = 1200;
  readonly canvasHeight = 600;
  readonly trackLineWidth = 15;

  tracks: TrackSegment[] = [];
  signals: Signal[] = [];
  
  // FIXED: Converted to a reactive Signal so Angular detects movements instantly
  trains = signal<Train[]>([]); 
  private trainCounter = 0;

  initializeLayout(): void {
    this.tracks = [];
    this.signals = [];
    this.trains.set([]);

    for (let i = 1; i <= 2; i++) {
      this.tracks.push({ id: `loop_p${i}`, type: 'loop', direction: 'up', platformNumber: i, y: 120 + (i * 70) });
    }
    this.tracks.push({ id: 'up_main', type: 'main', direction: 'up', y: 120 });

    for (let i = 3; i <= 5; i++) {
      this.tracks.push({ id: `loop_p${i}`, type: 'loop', direction: 'down', platformNumber: i, y: 480 - ((5 - i) * 70) });
    }
    this.tracks.push({ id: 'down_main', type: 'main', direction: 'down', y: 550 });

    this.tracks.forEach(track => {
      for (let x = 10; x < this.canvasWidth; x += 200) {
        this.signals.push({ id: `sig_${track.id}_${x}`, trackId: track.id, x, state: 'GREEN' });
      }
      this.signals.push({ id: `sig_${track.id}_${this.canvasWidth - 10}`, trackId: track.id, x: this.canvasWidth - 10, state: 'GREEN' });
    });
  }

  spawnTrain(): void {
    this.trainCounter++;
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const isNonStop = Math.random() > 0.4;
    const mainTrackId = direction === 'up' ? 'up_main' : 'down_main';

    const validLoops = this.tracks.filter(t => t.type === 'loop' && t.direction === direction);
    const freeLoops = validLoops.filter(loop => !this.trains().some(t => t.targetTrackId === loop.id && t.status !== 'EXITED'));

    const selectedLoop = freeLoops.length > 0 ? freeLoops[Math.floor(Math.random() * freeLoops.length)] : validLoops[Math.floor(Math.random() * validLoops.length)];
    const targetTrackId = isNonStop ? mainTrackId : selectedLoop.id;

    const initialX = direction === 'up' ? -350 : this.canvasWidth + 350;
    const maxSpd = 1.2 + Math.random() * 1.5;

    const newTrain: Train = {
      id: `T${this.trainCounter}`,
      name: isNonStop ? `Express-${this.trainCounter}` : `Local-${this.trainCounter}`,
      direction,
      currentTrackId: mainTrackId,
      targetTrackId,
      x: initialX,
      length: 210 + Math.random() * 20,
      speed: maxSpd,
      maxSpeed: maxSpd,
      isNonStop,
      stopCounter: isNonStop ? 0 : 180 + Math.floor(Math.random() * 100),
      hasStoppedAtPlatform: false,
      isWaitingAtPlatform: false,
      color: isNonStop ? '#e63946' : '#457b9d',
      status: 'RUNNING'
    };

    const routeBlocked = this.trains().some(t => {
      if (t.currentTrackId !== mainTrackId) return false;
      return direction === 'up' ? t.x < 350 : t.x > (this.canvasWidth - 350);
    });

    if (!routeBlocked) {
      // FIXED: Added immutable update mechanics for modern reactive templates
      this.trains.update(current => [...current, newTrain]);
    }
  }

  getTrackY(trackId: string, x: number): number {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return 120;
    if (track.type === 'main') return track.y;

    const mainY = track.direction === 'up' ? 120 : 550;

    if (x <= 50) return mainY;
    if (x >= 1150) return mainY;

    if (x > 50 && x < 250) {
      const t = (x - 50) / 200;
      return getBezierY(t, mainY, mainY, track.y, track.y);
    }
    if (x > 950 && x < 1150) {
      const t = (x - 950) / 200;
      return getBezierY(t, track.y, track.y, mainY, mainY);
    }

    return track.y;
  }

  updateSignals(): void {
    // Basic Signal Logic stub (Kept for layout interface compatibility)
    this.signals.forEach(sig => {
      // Logic placeholder for your signaling system updates
    });
  }

  updatePhysics(): void {
    // FIXED: Added an update modifier wrapper block to trigger tracking updates
    this.trains.update(currentTrains => {
      currentTrains.forEach(train => {
        const isUp = train.direction === 'up';
        const mainTrackId = isUp ? 'up_main' : 'down_main';

        // Increment linear travel coordinates
        train.x += isUp ? train.speed : -train.speed;

        if (isUp) {
          if (train.x >= 50 && train.currentTrackId !== train.targetTrackId && !train.hasStoppedAtPlatform) {
            train.currentTrackId = train.targetTrackId;
          }
          if ((train.x - train.length) >= 1150 && train.currentTrackId !== mainTrackId) {
            train.currentTrackId = mainTrackId;
            train.status = 'EXITED';
          }
        } else {
          if (train.x <= 1150 && train.currentTrackId !== train.targetTrackId && !train.hasStoppedAtPlatform) {
            train.currentTrackId = train.targetTrackId;
          }
          if ((train.x + train.length) <= 50 && train.currentTrackId !== mainTrackId) {
            train.currentTrackId = mainTrackId;
            train.status = 'EXITED';
          }
        }

        let targetSpeed = train.maxSpeed;

        // Station Stop Control State Engine
        const currentTrack = this.tracks.find(t => t.id === train.currentTrackId)!;
        if (currentTrack && currentTrack.type === 'loop' && !train.isNonStop && !train.hasStoppedAtPlatform) {
          const platformMid = this.canvasWidth / 2;
          const stopTarget = isUp ? platformMid + 120 : platformMid - 120;
          const distToStation = isUp ? stopTarget - train.x : train.x - stopTarget;

          if (train.isWaitingAtPlatform) {
            targetSpeed = 0;
            if (train.stopCounter > 0) {
              train.stopCounter--;
              train.status = 'STOPPED';
            } else {
              train.isWaitingAtPlatform = false;
              train.hasStoppedAtPlatform = true;
              train.status = 'ACCELERATING';
            }
          } else if (distToStation > -20 && distToStation < 320) {
            if (distToStation <= 5) {
              train.isWaitingAtPlatform = true;
              targetSpeed = 0;
              train.status = 'STOPPED';
            } else {
              targetSpeed = Math.min(targetSpeed, train.maxSpeed * (distToStation / 320));
              train.status = 'BRAKING';
            }
          }
        }

        // Direction-Aware Headway Anti-Collision Math
        currentTrains.forEach(other => {
          if (train.id === other.id || other.status === 'EXITED') return;

          const trainLeft = isUp ? train.x - train.length : train.x;
          const trainRight = isUp ? train.x : train.x + train.length;
          const otherLeft = other.direction === 'up' ? other.x - other.length : other.x;
          const otherRight = other.direction === 'up' ? other.x : other.x + other.length;

          const segmentsMatch = (train.currentTrackId === other.currentTrackId) ||
                                (train.targetTrackId === other.currentTrackId && !train.hasStoppedAtPlatform) ||
                                (train.currentTrackId === other.targetTrackId && !other.hasStoppedAtPlatform);

          if (!segmentsMatch) return;

          const gap = isUp ? (otherLeft - trainRight) : (trainLeft - otherRight);
          if (gap > -40 && gap < 260) {
            const ratio = Math.max(0, (gap - 80) / 180);
            targetSpeed = Math.min(targetSpeed, train.maxSpeed * ratio);
            if (gap < 85) targetSpeed = 0;
          }
        });

        // Speed ramp filter
        if (train.speed < targetSpeed) train.speed = Math.min(train.speed + 0.05, targetSpeed);
        if (train.speed > targetSpeed) train.speed = Math.max(train.speed - 0.08, targetSpeed);
      });

      // Filter out trains that have fully left the view bounds to save memory
      return currentTrains.filter(t => t.direction === 'up' ? (t.x - t.length) < this.canvasWidth + 100 : (t.x + t.length) > -100);
    });
  }
}


@Component({
  selector: 'station-layout-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './station-layout-component.html',
  styleUrls: ['./station-layout-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class StationLayoutComponent implements OnInit, OnDestroy {
  private animationFrameId!: number;
  private spawnIntervalId: any;

  constructor(
    public simService: RailwaySimulationService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef // 2. Add to constructor parameters
  ) {}

  ngOnInit(): void {
    this.simService.initializeLayout();
    this.startSimulationLoop();
    this.spawnIntervalId = setInterval(() => this.simService.spawnTrain(), 3500);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.spawnIntervalId) clearInterval(this.spawnIntervalId);
  }

  private startSimulationLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        // Step 1: Run heavy physics updates outside of Zone management constraints
        this.simService.updatePhysics();
        this.simService.updateSignals();
        
        // Step 2: Manually flag the view tree layer for explicit re-paint validation checks
        // This removes NG0100 errors by structuring updates cleanly within single evaluation loops.
        this.cdr.detectChanges();

        this.animationFrameId = requestAnimationFrame(loop);
      };
      this.animationFrameId = requestAnimationFrame(loop);
    });
  }

  getTrackPath(track: any): string {
    const width = this.simService.canvasWidth;
    if (track.type === 'main') {
      return `M 0,${track.y} L ${width},${track.y}`;
    } else {
      const mainY = track.direction === 'up' ? 120 : 550;
      return `M 0,${mainY} L 50,${mainY} C 150,${mainY} 150,${track.y} 250,${track.y} L 950,${track.y} C 1050,${track.y} 1050,${mainY} 1150,${mainY} L ${width},${mainY}`;
    }
  }

  getTrainPath(train: any): string {
    if (!train) return 'M 0 0';

    const isUp = train.direction === 'up';
    const rawStartX = isUp ? train.x - train.length : train.x;
    const rawEndX = isUp ? train.x : train.x + train.length;

    const startX = Math.max(0, Math.min(this.simService.canvasWidth, rawStartX));
    const endX = Math.max(0, Math.min(this.simService.canvasWidth, rawEndX));

    if (startX === endX) return 'M 0 0';

    let currentY = this.simService.getTrackY(train.currentTrackId, startX);
    let pathData = `M ${startX},${currentY}`;

    for (let segmentX = startX + 5; segmentX <= endX; segmentX += 5) {
      currentY = this.simService.getTrackY(train.currentTrackId, segmentX);
      pathData += ` L ${segmentX},${currentY}`;
    }

    currentY = this.simService.getTrackY(train.currentTrackId, endX);
    pathData += ` L ${endX},${currentY}`;

    return pathData;
  }

  getSignalColor(state: string): string {
    if (state === 'GREEN') return '#198754';
    if (state === 'YELLOW') return '#ffc107';
    return '#dc3545';
  }
}
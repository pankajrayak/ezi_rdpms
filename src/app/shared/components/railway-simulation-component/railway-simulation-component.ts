import { CommonModule } from "@angular/common";
import { Injectable, Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";

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
  isWaitingAtPlatform: boolean; // Secures station sequencing states against deadlocks
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
  trains: Train[] = [];
  private trainCounter = 0;

  initializeLayout(): void {
    this.tracks = [];
    this.signals = [];
    this.trains = [];

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
      this.signals.push({ id: `sig_${track.id}_${this.canvasWidth-10}`, trackId: track.id, x: this.canvasWidth-10, state: 'GREEN' });
    });
  }

  spawnTrain(): void {
    this.trainCounter++;
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const isNonStop = Math.random() > 0.4;
    const mainTrackId = direction === 'up' ? 'up_main' : 'down_main';

    const validLoops = this.tracks.filter(t => t.type === 'loop' && t.direction === direction);
    const freeLoops = validLoops.filter(loop => !this.trains.some(t => t.targetTrackId === loop.id && t.status !== 'EXITED'));

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

    const routeBlocked = this.trains.some(t => {
      if (t.currentTrackId !== mainTrackId) return false;
      return direction === 'up' ? t.x < 350 : t.x > (this.canvasWidth - 350);
    });

    if (!routeBlocked) {
      this.trains.push(newTrain);
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

  updatePhysics(): void {
    this.trains.forEach(train => {
      const isUp = train.direction === 'up';
      const mainTrackId = isUp ? 'up_main' : 'down_main';

      if (isUp) {
        if (train.x >= 50 && train.currentTrackId !== train.targetTrackId && !train.hasStoppedAtPlatform) {
          train.currentTrackId = train.targetTrackId;
        }
        if ((train.x - train.length) >= 1150 && train.currentTrackId !== mainTrackId) {
          train.currentTrackId = mainTrackId;
        }
      } else {
        if (train.x <= 1150 && train.currentTrackId !== train.targetTrackId && !train.hasStoppedAtPlatform) {
          train.currentTrackId = train.targetTrackId;
        }
        if ((train.x + train.length) <= 50 && train.currentTrackId !== mainTrackId) {
          train.currentTrackId = mainTrackId;
        }
      }

      let targetSpeed = train.maxSpeed;

      // Station Stop Control State Engine
      const currentTrack = this.tracks.find(t => t.id === train.currentTrackId)!;
      if (currentTrack.type === 'loop' && !train.isNonStop && !train.hasStoppedAtPlatform) {
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
      this.trains.forEach(other => {
        if (train.id === other.id) return;

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

      // Signaling Interlocks
      const relevantSignals = this.signals.filter(s => s.trackId === train.currentTrackId);
      const filteredSignals = isUp
        ? relevantSignals.filter(s => s.x > train.x).sort((a, b) => a.x - b.x)
        : relevantSignals.filter(s => s.x < train.x).sort((a, b) => b.x - a.x);

      // FIXED: Extract the single closest Signal object from index 0
      const targetSignal = filteredSignals.length > 0 ? filteredSignals[0] : undefined;

      if (targetSignal && currentTrack.type !== 'main') {
        const distToSignal = isUp ? targetSignal.x - train.x : train.x - targetSignal.x;
        if (distToSignal < 200) {
          if (targetSignal.state === 'RED') {
            targetSpeed = 0;
          } else if (targetSignal.state === 'YELLOW') {
            targetSpeed = train.maxSpeed * 0.35;
          }
        }
      }

      // FIXED: Multi-Loop Switch Interlocking Protection Matrix
      if (train.currentTrackId !== mainTrackId) {
        const isApproachingMerge = isUp ? (train.x > 800 && train.x < 950) : (train.x < 400 && train.x > 250);
        if (isApproachingMerge) {
          
          // Check 1: Is a train already on the mainline merge zone?
          const mainlineOccupied = this.trains.some(t => {
            if (t.id === train.id || t.currentTrackId !== mainTrackId) return false;
            return isUp ? (t.x > 750 && t.x < 1180) : (t.x < 450 && t.x > 20);
          });

          // Check 2: Is another train on an adjacent loop track also entering the merge zone?
          const adjacentLoopConflict = this.trains.some(t => {
            if (t.id === train.id || t.currentTrackId === mainTrackId || t.direction !== train.direction) return false;
            
            const otherApproaching = isUp ? (t.x > 800 && t.x < 1150) : (t.x < 400 && t.x > 50);
            if (!otherApproaching) return false;

            // Resolve priority using the train instantiation count order (First spawned gets priority)
            const currentTrainIndex = parseInt(train.id.replace('T', ''), 10);
            const otherTrainIndex = parseInt(t.id.replace('T', ''), 10);
            return otherTrainIndex < currentTrainIndex;
          });

          if (mainlineOccupied || adjacentLoopConflict) {
            targetSpeed = 0;
            if (train.status !== 'STOPPED') train.status = 'BRAKING';
          }
        }
      }

      if (targetSpeed === 0) {
        train.speed = Math.max(0, train.speed - 0.08);
        if (train.speed === 0 && !train.isWaitingAtPlatform) train.status = 'STOPPED';
      } else if (train.speed < targetSpeed) {
        train.speed = Math.min(targetSpeed, train.speed + 0.04);
        if (train.status === 'STOPPED' || train.status === 'BRAKING') train.status = 'ACCELERATING';
      } else if (train.speed > targetSpeed) {
        train.speed = Math.max(targetSpeed, train.speed - 0.08);
        train.status = 'BRAKING';
      }

      if (train.speed > 0.15 && train.status !== 'BRAKING' && train.status !== 'ACCELERATING' && train.status !== 'STOPPED') {
        train.status = 'RUNNING';
      }

      train.x += isUp ? train.speed : -train.speed;
    });

    this.trains = this.trains.filter(t => t.x > -400 && t.x < this.canvasWidth + 400);
  }

  updateSignals(): void {
    this.signals.forEach(sig => {
      const track = this.tracks.find(t => t.id === sig.trackId)!;
      const isUp = track.direction === 'up';

      let closestAheadDist = Infinity;
      const occupiedBy = this.trains.filter(t => t.currentTrackId === sig.trackId);

      occupiedBy.forEach(t => {
        const tLeft = t.direction === 'up' ? t.x - t.length : t.x;
        const tRight = t.direction === 'up' ? t.x : t.x + t.length;

        const dist = isUp ? tLeft - sig.x : sig.x - tRight;
        if (dist > -t.length && dist < 250) {
          closestAheadDist = Math.min(closestAheadDist, dist);
        }
      });

      if (closestAheadDist > -20 && closestAheadDist < 50) {
        sig.state = 'RED';
      } else if (closestAheadDist >= 50 && closestAheadDist < 200) {
        sig.state = 'YELLOW';
      } else {
        sig.state = 'GREEN';
      }
    });
  }
}



@Component({
  selector: 'railway-simulation-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './railway-simulation-component.html',
  styleUrls: ['./railway-simulation-component.css']
})
export class RailwaySimulationComponent implements OnInit, OnDestroy {
  @ViewChild('simulationCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId!: number;
  private spawnIntervalId: any;

  constructor(public simService: RailwaySimulationService) {}

  ngOnInit(): void {
    this.initCanvas();
    this.simService.initializeLayout();
    this.startSimulationLoop();
    this.spawnIntervalId = setInterval(() => this.simService.spawnTrain(), 3500);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.spawnIntervalId) clearInterval(this.spawnIntervalId);
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.simService.canvasWidth;
    canvas.height = this.simService.canvasHeight;
    this.ctx = canvas.getContext('2d')!;
  }

  private startSimulationLoop(): void {
    const loop = () => {
      this.simService.updatePhysics();
      this.simService.updateSignals();
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.simService.canvasWidth, this.simService.canvasHeight);
    this.ctx.fillStyle = '#111215';
    this.ctx.fillRect(0, 0, this.simService.canvasWidth, this.simService.canvasHeight);

    this.simService.tracks.forEach(track => {
      if (track.type === 'loop' && track.platformNumber) {
        const midX = this.simService.canvasWidth / 2;
        this.ctx.fillStyle = '#212529';
        this.ctx.fillRect(midX - 180, track.y - 25, 360, 8);
        this.ctx.fillStyle = '#6c757d';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.fillText(`PLATFORM ${track.platformNumber}`, midX - 30, track.y - 30);
      }
    });

    this.simService.tracks.forEach(track => {
      this.ctx.strokeStyle = track.type === 'main' ? '#495057' : '#2b3035';
      this.ctx.lineWidth = this.simService.trackLineWidth;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();

      if (track.type === 'main') {
        this.ctx.moveTo(0, track.y);
        this.ctx.lineTo(this.simService.canvasWidth, track.y);
        this.ctx.stroke();
      } else {
        const mainY = track.direction === 'up' ? 120 : 550;
        this.ctx.moveTo(0, mainY);
        this.ctx.lineTo(50, mainY);
        this.ctx.bezierCurveTo(150, mainY, 150, track.y, 250, track.y);
        this.ctx.lineTo(950, track.y);
        this.ctx.bezierCurveTo(1050, track.y, 1050, mainY, 1150, mainY);
        this.ctx.lineTo(this.simService.canvasWidth, mainY);
        this.ctx.stroke();
      }
    });

    this.simService.signals.forEach(sig => {
      const track = this.simService.tracks.find(t => t.id === sig.trackId)!;
      if (track.type === 'loop' && (sig.x < 250 || sig.x > 950)) return;

      const computedY = this.simService.getTrackY(sig.trackId, sig.x);
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(sig.x - 3, computedY - 18, 6, 12);

      this.ctx.beginPath();
      this.ctx.arc(sig.x, computedY - 12, 3.5, 0, Math.PI * 2);
      this.ctx.fillStyle = sig.state === 'GREEN' ? '#198754' : sig.state === 'YELLOW' ? '#ffc107' : '#dc3545';
      this.ctx.fill();
    });

    this.simService.trains.forEach(train => {
      const isUp = train.direction === 'up';
      
      this.ctx.save();
      this.ctx.fillStyle = train.color;
      this.ctx.lineWidth = this.simService.trackLineWidth;
      this.ctx.strokeStyle = train.color;
      this.ctx.lineCap = 'round';

      this.ctx.beginPath();
      
      if (isUp) {
        const startX = train.x - train.length;
        const startY = this.simService.getTrackY(train.currentTrackId, startX);
        this.ctx.moveTo(startX, startY);

        for (let segmentX = startX + 5; segmentX <= train.x; segmentX += 5) {
          const segmentY = this.simService.getTrackY(train.currentTrackId, segmentX);
          this.ctx.lineTo(segmentX, segmentY);
        }
      } else {
        const startX = train.x;
        const startY = this.simService.getTrackY(train.currentTrackId, startX);
        this.ctx.moveTo(startX, startY);

        for (let segmentX = startX + 5; segmentX <= train.x + train.length; segmentX += 5) {
          const segmentY = this.simService.getTrackY(train.currentTrackId, segmentX);
          this.ctx.lineTo(segmentX, segmentY);
        }
      }
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      const cabX = train.x;
      const cabY = this.simService.getTrackY(train.currentTrackId, cabX);
      this.ctx.beginPath();
      this.ctx.arc(cabX, cabY, 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();

      const labelX = isUp ? (train.x - train.length) : train.x;
      const labelY = this.simService.getTrackY(train.currentTrackId, labelX);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.fillText(`${train.name} (${train.status})`, labelX, labelY - 24);
      this.ctx.fillStyle = '#6c757d';
      this.ctx.font = '9px monospace';
      this.ctx.fillText(`V: ${train.speed.toFixed(1)} | Halt: ${train.stopCounter}`, labelX, labelY - 14);
    });
  }
}

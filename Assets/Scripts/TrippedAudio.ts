// TrippedAudio — SFX playback helper. Owns three AudioComponents (tick / clunk / chime),
// all LowLatency so cues fire immediately after a pinch (Specs defaults to LowPower).
// Driven by the state manager: playTick(), playClunk(), playChime().

const TICK = requireAsset("../GeneratedSFX/StepTick.wav") as AudioTrackAsset
const CLUNK = requireAsset("../GeneratedSFX/RcdClunk.wav") as AudioTrackAsset
const CHIME = requireAsset("../GeneratedSFX/FaultChime.wav") as AudioTrackAsset

@component
export class TrippedAudio extends BaseScriptComponent {
  private tick!: AudioComponent
  private clunk!: AudioComponent
  private chime!: AudioComponent

  onAwake() {
    this.tick = this.make(TICK, 0.9)
    this.clunk = this.make(CLUNK, 1.0)
    this.chime = this.make(CHIME, 0.9)
  }

  private make(track: AudioTrackAsset, volume: number): AudioComponent {
    const a = this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent
    a.audioTrack = track
    a.volume = volume
    a.playbackMode = Audio.PlaybackMode.LowLatency
    return a
  }

  playTick(): void { if (this.tick) this.tick.play(1) }
  playClunk(): void { if (this.clunk) this.clunk.play(1) }
  playChime(): void { if (this.chime) this.chime.play(1) }
}

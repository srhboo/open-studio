import * as Tone from "tone";

export class MovementPlayer {
  constructor(audioFile) {
    this.audio = audioFile;
    this.player = null;
    this.initializePlayer();
  }
  initializePlayer() {
    console.log("initialize");
    const player = new Tone.Player(this.audio).toDestination();
    this.player = player;
    this.player.sync(0).start();
    player.autostart = false;
    player.fadeOut = 8;
    player.fadeIn = 0.5;
  }
  play() {
    console.log(Tone.Transport.state);
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }
  }
  pause() {
    Tone.Transport.pause();
  }
  dispose() {
    this.player.dispose();
    Tone.Transport.dispose();
  }
}

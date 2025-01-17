<template>
  <div ref="goals" class="goals-wrapper">
    <!-- DONUT -->
    <vc-donut
      class="chart"
      background="#210235"
      foreground="inherit"
      unit="px"
      :size="148"
      :thickness="5"
      :total="100"
      :sections="sections"
      :start-angle="0"
    >
      <!-- :total="totalGoalPercentage" -->
      <div class="inner-circle">{{ tweenedPercent.toFixed(2) }}%</div>
      <div>SUCCESS</div>
    </vc-donut>

    <!-- GOALS -->
    <div class="bottom-icons">
      <span v-for="(goal, index) in detectorsHit" :key="'detectorh' + index" class="hit">
        <img src="@/assets/detectorIconRed.svg" alt="Key Icon" width="30" />
      </span>
      <span v-for="(goal, index) in detectorsUnhit" :key="'detectoru' + index" class="unhit">
        <img src="@/assets/detectorIconGreen.svg" alt="Key Icon" width="30" />
      </span>
      <div>DETECTORS</div>
    </div>

    <!-- MINES -->
    <div v-if="mines > 0" class="bottom-icons">
      <span v-for="(mine, index) in minesHit" :key="'mineh' + index" class="hit">
        <img src="@/assets/mineIconRed.svg" alt="Key Icon" width="34" />
      </span>
      <span v-for="(mine, index) in minesUnhit" :key="'mineu' + index" class="unhit">
        <img src="@/assets/mineIconEmpty.svg" alt="Key Icon" width="34" />
      </span>
      <div>DANGER</div>
    </div>
    <!-- <div class="temp">
      <div>Max: {{ totalGoalPercentage }} %</div>
      <div>Unavailable: {{ unavailableGoalPercentage }} %</div>
      <div>Current: {{ percentage.toFixed() }} %</div>
    </div> -->

    <!-- DETECTION EVENTS -->
    <!-- <svg v-for="(detection, index) in detections" :key="'detection' + index" class="detection">
      <g>
        <app-cell :cell="detection.cell" />
        <text class="counter" x="100px" y="50%">
          {{ (detection.probability * 100).toFixed(2) }}%
        </text>
      </g>
    </svg>
    <div>DETECTION EVENTS</div>-->
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Tween, update as updateTween } from 'es6-tween';
import { GameState } from '@/engine/interfaces';
import Cell from '@/engine/Cell';
import Goal from '@/engine/Goal';
import AppCell from '@/components/Board/AppCell.vue';

@Component({
  components: {
    AppCell
  }
})
export default class GameGoals extends Vue {
  @Prop() readonly detectors!: number;
  @Prop() readonly mines!: number;
  @Prop() readonly detections!: { cell: Cell; probability: number }[];
  @Prop() readonly goals!: any;
  @Prop() readonly percentage!: number;
  tweenedPercent: number = this.percentage;
  width = 100;

  /**
   * Compute game state and sets Vuex
   */
  computeGameState() {
    let probabilityFlag = false;
    let goalFlag = false;
    let safeFlag = false;
    // Compute the current detection probability and compare it to goals
    if (this.percentage >= this.totalGoalPercentage) {
      probabilityFlag = true;
    }
    // Check that the current goals are met
    if (this.detectorsUnhit === 0) {
      goalFlag = true;
    }
    // Check that no mines are hit so it's safe
    if (this.minesHit === 0) {
      safeFlag = true;
    }

    if (!safeFlag) {
      this.$store.commit('SET_GAME_STATE', GameState.MineExploded);
      this.$emit('gameState', GameState.MineExploded);
      return;
    }
    if ((!goalFlag && probabilityFlag) || (goalFlag && !probabilityFlag)) {
      this.$store.commit('SET_GAME_STATE', GameState.InProgress);
      this.$emit('gameState', GameState.InProgress);
    }
    if (probabilityFlag && goalFlag && safeFlag) {
      this.$store.commit('SET_GAME_STATE', GameState.Victory);
      this.$emit('gameState', GameState.Victory);
    }
  }

  /**
   * Process the detection events and select the detectors
   * @returns hit detector count
   */
  get detectorsHit(): number {
    const detectorDetected = this.detections.filter((detection) => {
      return detection.cell.isDetector;
    });
    return detectorDetected.length;
  }

  /**
   * Process the detection events and select the detectors
   * @returns hit detector count
   */
  get detectorsUnhit(): number {
    return this.goals.length - this.detectorsHit;
  }

  /**
   * Process the detection events and select the mines
   * @returns hit mines count
   */
  get minesHit(): number {
    const minesDetected = this.detections.filter((detection) => {
      return detection.cell.element.name === 'Mine' && detection.probability > 0.1;
    });
    return minesDetected.length;
  }

  /**
   * Process the detection events and select the detectors
   * @returns hit detector count
   */
  get minesUnhit(): number {
    return this.mines - this.minesHit;
  }

  /**
   * Compute the total absorption at goals
   * @returns total absorption
   */
  get updatePercentage() {
    let sum = 0;
    this.detections.forEach((detection) => {
      this.goals.forEach((goal: Goal) => {
        if (goal.coord.equal(detection.cell.coord)) {
          sum += detection.probability;
        }
      });
    });
    return sum;
  }

  /**
   * Total goal percentage
   * @returns sum of goal threshold
   */
  get totalGoalPercentage() {
    let sum = 0;
    this.goals.forEach((goal: Goal) => {
      sum += goal.threshold;
    });
    return sum * 100;
  }

  /**
   * Total goal percentage
   * @returns sum of goal threshold
   */
  get unavailableGoalPercentage() {
    return 100 - this.totalGoalPercentage;
  }

  /**
   * @param time tween time
   */
  animateTween(time: number): void {
    const id = requestAnimationFrame(this.animateTween);
    const result = updateTween(time);
    if (!result) cancelAnimationFrame(id);
  }

  /**
   * Computes donut slices
   * @returns list of slices with colors
   * FIXME: See level 7 problem
   */
  get sections() {
    return [
      { value: 100 - this.tweenedPercent, color: '#210235' },
      { value: this.tweenedPercent, color: '#5D00D5' }
    ];
  }

  @Watch('percentage')
  onPercentChanged(val: number, oldVal: number) {
    new Tween({ value: oldVal })
      .to({ value: val }, 500)
      .on('update', ({ value }: { value: number }) => {
        this.tweenedPercent = value;
      })
      .start();
    requestAnimationFrame(this.animateTween);
    this.computeGameState();
  }
}
</script>

<style lang="scss" scoped>
.goals-wrapper {
  // BORDER-TOP TURNED ON WHEN THERE ARE UPPER ICONS
  //border-top: 1px solid white;
  padding-top: 10px;
  padding-bottom: 20px;
  //border-bottom: 1px solid white;
  width: 100%;
  // height: 320px;
  display: flex;
  flex-direction: column;

  & .upper-icons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    //justify-content: left;
    margin-bottom: 2rem;
  }
  & .bottom-icons {
    line-height: 150%;
    padding: 10px;
  }
  & .chart {
    & div.inner-circle {
      font-size: 2rem;
    }
    margin-bottom: 2rem;

    position: relative;

    &::after {
      content: '';
      position: absolute;
      width: 155px;
      height: 155px;
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }
  }

  & .btn-fake {
    border: 1px solid;
    width: 50%;
    margin: 0 auto 50px;
    padding: 10px;
    cursor: pointer;
  }
}
.detection {
  width: 100%;
  max-height: 64px;
  .counter {
    fill: white;
    stroke: white;
    text-anchor: middle;
  }
}
.temp {
  font-size: 0.6rem;
  color: darkgrey;
}
</style>

import { GoalInterface } from './interfaces';
import Coord from './Coord';

/**
 * GOAL CLASS
 * The goals to be achieved by the player
 */
export default class Goal extends Coord {
  coord: Coord;
  threshold: number;
  value: number;

  constructor(coord: Coord, threshold: number, value = 0) {
    super(coord.y, coord.x);
    this.coord = coord;
    this.threshold = threshold;
    this.value = value;
  }

  /**
   * Is a goal completed
   * @returns boolean if the goal is completed
   */
  get completed(): boolean {
    return this.value >= this.threshold;
  }

  /**
   * Returns a percentage of the current value compared to the expected value.
   * @returns number from 0 to 1 describing percentage
   */
  get percentage(): number {
    return (this.value / this.threshold) * 100;
  }

  /**
   * Override toString() method to display the goal
   * @returns string
   */
  toString(): string {
    return `{#Goal ${this.completed ? 'completed ' : ' '}@ ${this.coord.toString()} is ${
      this.value
    } / ${this.threshold}} (${this.percentage}%)`;
  }

  /**
   * Export goal to primitives
   * @returns a goal interface
   */
  exportGoal(): GoalInterface {
    return {
      coord: this.coord.exportCoord(),
      threshold: this.threshold,
      value: this.value
    };
  }

  /**
   * Import goals from list of interfaces
   * @param goalObjs List of interfaces
   * @returns list of Goal instances
   */
  static importGoal(goalObjs: GoalInterface[]): Goal[] {
    return goalObjs.map((goal) => {
      const { coord } = goal;
      return new Goal(Coord.importCoord(coord), goal.threshold);
    });
  }

  /**
   * Output formatted list of goals
   * @param goals list of goals
   * @returns formatted string describing goals
   */

  static manyToString(goals: Goal[]): string {
    let result = `${goals.length} active goals...\n`;
    goals.forEach((goal) => {
      result += `- ${goal.toString()}\n`;
    });
    return result;
  }
}

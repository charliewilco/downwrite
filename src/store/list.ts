import { makeAutoObservable } from "mobx";

export interface IPostListState {
  isGridView: boolean;
}

export class PostGrid {
  isGridView: boolean = true;
  constructor() {
    makeAutoObservable(this);
  }
  toggle() {
    this.isGridView = !this.isGridView;
  }

  setGrid(v: boolean) {
    this.isGridView = v;
  }
}

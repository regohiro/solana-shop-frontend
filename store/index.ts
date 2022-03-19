import create from "zustand";
import itemSlice from "./itemSlice";
import shopSlice from "./shopSlice";
import { devtools } from "zustand/middleware";
import { StoreState } from "./types";
import userSlice from "./userSlice";

export const useStore = create<StoreState>(
  devtools((set, get) => ({
    ...itemSlice(set, get),
    ...shopSlice(set, get),
    ...userSlice(set, get)
  })),
);

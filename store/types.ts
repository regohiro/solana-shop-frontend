import { GetState, SetState } from "zustand";
import { ItemSlice } from "./itemSlice";
import { ShopSlice } from "./shopSlice";
import { UserSlice } from "./userSlice";

export type StoreState = ItemSlice & ShopSlice & UserSlice;
export type StoreSlice<T> = (set: SetState<StoreState>, get: GetState<StoreState>) => T;
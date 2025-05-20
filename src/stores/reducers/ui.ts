import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "ui",
  initialState: {} as {},
  reducers: {},
});

export const actions = {
  ...slice.actions,
};

export default slice.reducer;

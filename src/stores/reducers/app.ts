import { createSlice } from '@reduxjs/toolkit';

type AppState = {};

const slice = createSlice({
  name: 'app',
  initialState: {} as AppState,
  reducers: {},
});

export const actions = {
  ...slice.actions,
};

export default slice.reducer;

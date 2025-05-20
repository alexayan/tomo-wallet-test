import { combineReducers } from '@reduxjs/toolkit';
import ui, { actions as uiActions } from './ui';
import app, { actions as appActions } from './app';
import user, { actions as userActions } from './user';

export default combineReducers({
  ui,
  app,
  user,
});

export const actions = {
  ui: uiActions,
  app: appActions,
  user: userActions,
};

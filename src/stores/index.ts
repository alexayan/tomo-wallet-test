import { Middleware, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useStore } from 'react-redux';
import rootReducer from './reducers';

export { actions } from './reducers';

const modules: Middleware[] = [];

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [],
        ignoredActionPaths: [],
      },
    }).concat(modules),
});

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useTypedStore = useStore;
export default store;

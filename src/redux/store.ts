import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import dataReducer from './dataSlice';
import modalReducer from './modalSlice';
import roomReducer from './roomSlice';

// Configuration for the persisted reducers
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'data', 'room'],
};

const rootReducer = combineReducers({
    auth: authReducer,
    data: dataReducer,
    modal: modalReducer,
    room: roomReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Correctly type 'persistor'
export type RootState = ReturnType<typeof store.getState>;
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';

/** Static (non-dynamic) routes that always appear last in the router config. */
export const STATIC_ROUTES = new InjectionToken<Routes>('STATIC_ROUTES');

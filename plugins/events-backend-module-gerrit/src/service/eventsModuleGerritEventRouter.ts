/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createBackendModule } from '@backstage/backend-plugin-api';
import { eventsExtensionPoint } from '@backstage/plugin-events-node/alpha';
import { GerritEventRouter } from '../router/GerritEventRouter';

/**
 * Module for the events-backend plugin, adding an event router for Gerrit.
 *
 * Registers the `GerritEventRouter`.
 *
 * @alpha
 */
export const eventsModuleGerritEventRouter = createBackendModule({
  pluginId: 'events',
  moduleId: 'gerrit-event-router',
  register(env) {
    env.registerInit({
      deps: {
        events: eventsExtensionPoint,
      },
      async init({ events }) {
        const eventRouter = new GerritEventRouter();

        events.addPublishers(eventRouter);
        events.addSubscribers(eventRouter);
      },
    });
  },
});

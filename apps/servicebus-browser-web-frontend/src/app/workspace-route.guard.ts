import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { UUID } from '@service-bus-browser/shared-contracts';
import { WorkspaceService } from '@service-bus-browser/services';
import { WorkspaceSwitchService } from './workspace-switch.service';

/**
 * Guards the `:workspaceId` route segment. An unresolvable id (missing,
 * unknown, or restructured away on redeploy) redirects to the fallback
 * workspace's default route. A resolvable id that differs from the
 * currently active workspace is activated in place — this fires on boot and
 * on every later change of `:workspaceId` (address bar edit, back/forward),
 * since the route is configured with `runGuardsAndResolvers: 'paramsChange'`.
 */
export const workspaceActivationGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
) => {
  const workspaceService = inject(WorkspaceService);
  const switchService = inject(WorkspaceSwitchService);
  const router = inject(Router);

  const workspaces = await workspaceService.ensureWorkspacesLoaded();
  const requestedId = route.paramMap.get('workspaceId') as UUID | null;
  const workspace = workspaces.find((w) => w.id === requestedId);

  if (!workspace) {
    const fallback = workspaceService.resolveFallback();
    return router.parseUrl(workspaceService.workspaceUrl('/', fallback.id));
  }

  if (workspaceService.activeWorkspace()?.id !== workspace.id) {
    await switchService.activate(workspace, { persist: false });
  }

  return true;
};

/** Guards the bare root path — always redirects into the fallback workspace's default route. */
export const rootWorkspaceRedirectGuard: CanActivateFn = async () => {
  const workspaceService = inject(WorkspaceService);
  const router = inject(Router);

  await workspaceService.ensureWorkspacesLoaded();
  const fallback = workspaceService.resolveFallback();
  return router.parseUrl(workspaceService.workspaceUrl('/', fallback.id));
};

/**
 * Guards the unprefixed `popups` route tree. Popups don't carry a
 * `:workspaceId` segment (ADR-0009), but a fresh popup window still needs its
 * messages-db repository initialized before anything can read message data —
 * previously handled by a boot-time APP_INITIALIZER that ran for every
 * window regardless of route, removed when workspace activation moved onto
 * the `:workspaceId` guard. Reads the opener-supplied `workspaceId` query
 * param so the popup shows the same workspace's data as its opener, falling
 * back like the root guard when it's missing or stale.
 */
export const popupWorkspaceActivationGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
) => {
  const workspaceService = inject(WorkspaceService);
  const switchService = inject(WorkspaceSwitchService);

  const workspaces = await workspaceService.ensureWorkspacesLoaded();
  const requestedId = route.queryParamMap.get('workspaceId') as UUID | null;
  const workspace =
    workspaces.find((w) => w.id === requestedId) ?? workspaceService.resolveFallback();

  if (workspaceService.activeWorkspace()?.id !== workspace.id) {
    await switchService.activate(workspace, { persist: false });
  }

  return true;
};

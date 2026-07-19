import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Workspace } from '@service-bus-browser/shared-contracts';

function openPopup(
  router: Router,
  location: Location,
  commands: unknown[],
  queryParams?: Record<string, string>,
): void {
  const urlTree = router.createUrlTree(commands, { queryParams });
  const serialized = router.serializeUrl(urlTree);
  const external = location.prepareExternalUrl(serialized);
  const url = new URL(external, window.location.href).toString();
  window.open(url, '_blank', 'width=500,height=300');
}

export function openCreateWorkspacePopup(router: Router, location: Location): void {
  openPopup(router, location, ['/popups/workspaces/add']);
}

export function openEditWorkspacePopup(
  router: Router,
  location: Location,
  workspace: Workspace,
): void {
  openPopup(router, location, ['/popups/workspaces/edit', workspace.id], {
    name: workspace.name,
    color: workspace.primaryColor ?? '',
  });
}

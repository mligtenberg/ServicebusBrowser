import { Location } from '@angular/common';
import { Router } from '@angular/router';

export function openCreateWorkspacePopup(router: Router, location: Location): void {
  const urlTree = router.createUrlTree(['/popups/workspaces/add']);
  const serialized = router.serializeUrl(urlTree);
  const external = location.prepareExternalUrl(serialized);
  const url = new URL(external, window.location.href).toString();
  window.open(url, '_blank', 'width=420,height=420');
}

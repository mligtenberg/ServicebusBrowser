import { Location } from '@angular/common';
import { Router } from '@angular/router';

export function openAddConnectionPopup(router: Router, location: Location): void {
  const urlTree = router.createUrlTree(['/popups/connections/add']);
  const serialized = router.serializeUrl(urlTree);
  const external = location.prepareExternalUrl(serialized);
  const url = new URL(external, window.location.href).toString();
  window.open(url, '_blank', 'width=900,height=700');
}

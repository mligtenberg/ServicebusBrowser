import { Location } from '@angular/common';
import { Router } from '@angular/router';

export function openMcpSettingsPopup(router: Router, location: Location): void {
  const urlTree = router.createUrlTree(['/popups/mcp-settings']);
  const serialized = router.serializeUrl(urlTree);
  const external = location.prepareExternalUrl(serialized);
  const url = new URL(external, window.location.href).toString();
  window.open(url, '_blank', 'width=500,height=650');
}
